"""
Build js/data.js from the manual baseline (tools/manual-ratings.js) plus real
Premier League stats from the Transfermarkt dataset at
https://github.com/salimt/football-datasets

Usage:
    python tools/build_ratings.py --perf player_performances.csv --profiles player_profiles.csv

Download the two CSVs from the dataset repo first:
    datalake/transfermarkt/player_performances/player_performances.csv   (Git LFS, ~160 MB)
    datalake/transfermarkt/player_profiles/player_profiles.csv

Method
  1. Every player in the baseline is matched to their Premier League seasons for
     that club inside that era (full-name match, then unique surname match).
  2. A stat score is computed per group:
       attackers (LW/ST/RW):  (goals + 0.6 * assists) per match
       midfielders (CM):      (goals + assists) per match
       goalkeepers:           (clean sheets - 0.35 * goals conceded) per match
     Peak = average of the two best seasons with 10+ apps, combined 80/20 with
     longevity (log of total apps).
  3. Scores are mapped onto the same rating distribution as the manual ratings
     (quantile mapping), then blended with the manual rating:
       weight 0.6 attackers, 0.5 goalkeepers, 0.4 midfielders,
       scaled down for players with fewer than 60 apps.
     The change is capped at -3 / +4. Midfielders can only go up, because goal
     stats miss defensive work. Defenders and unmatched players keep the manual rating.
  4. Secondary-position ratings move by the same amount as the main rating.
"""
import argparse, json, math, re, unicodedata
from pathlib import Path
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
TEAM = {"ARS": "Arsenal FC", "CHE": "Chelsea FC", "LIV": "Liverpool FC", "MUN": "Manchester United",
        "MCI": "Manchester City", "TOT": "Tottenham Hotspur", "NEW": "Newcastle United", "EVE": "Everton FC",
        "AVL": "Aston Villa", "WHU": "West Ham United", "LEE": "Leeds United", "BLB": "Blackburn Rovers",
        "LEI": "Leicester City"}
ERA = {"90s": (1992, 1999), "00s": (2000, 2009), "10s": (2010, 2019), "20s": (2020, 2025)}
GROUP = {"LW": "ATT", "ST": "ATT", "RW": "ATT", "CM": "MID", "GK": "GK"}
WEIGHT = {"ATT": 0.6, "MID": 0.4, "GK": 0.5}


def norm(n):
    n = re.sub(r"\s*\(\d+\)$", "", str(n))
    for a, b in [("ø", "o"), ("Ø", "O"), ("æ", "ae"), ("ł", "l"), ("đ", "d"), ("ß", "ss")]:
        n = n.replace(a, b)
    n = unicodedata.normalize("NFKD", n).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z]+", " ", n).strip()


def load_baseline(text):
    """Yield (club, era, name, [(pos, rating), ...]) from manual-ratings.js."""
    club = None
    for line in text.split("\n"):
        mc = re.match(r"\s+([A-Z]{3}): \{ name:", line)
        if mc:
            club = mc.group(1)
        me = re.match(r'\s+"(\d0s)": \[', line)
        if me:
            for name, lst in re.findall(r'"([^"|]+)\|([A-Z:0-9,]+)"', line):
                opts = [(p, int(r)) for p, r in (x.split(":") for x in lst.split(","))]
                yield club, me.group(1), name, opts


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--perf", required=True)
    ap.add_argument("--profiles", required=True)
    args = ap.parse_args()

    perf = pd.read_csv(args.perf, low_memory=False)
    pl = perf[perf.competition_id == "GB1"].copy()
    prof = pd.read_csv(args.profiles, low_memory=False, usecols=["player_id", "player_name"])
    pl = pl.merge(prof, on="player_id")
    pl["n"] = pl.player_name.map(norm)
    pl["y"] = pl.season_name.str[:2].astype(int).map(lambda y: 1900 + y if y > 50 else 2000 + y)

    base_text = (ROOT / "tools/manual-ratings.js").read_text()
    players = []
    for club, era, name, opts in load_baseline(base_text):
        o = {"club": club, "era": era, "name": name, "main": opts[0][0], "rating": opts[0][1], "opts": opts}
        a, b = ERA[era]
        c = pl[(pl.team_name == TEAM[club]) & (pl.y >= a) & (pl.y <= b)]
        nn = norm(name)
        m = c[c.n == nn]
        if m.empty:
            last, first = nn.split()[-1], nn.split()[0]
            m2 = c[c.n.str.split().str[-1] == last]
            if m2.player_id.nunique() == 1:
                m = m2
            else:
                m3 = (c[c.n.str.contains(rf"\b{last}\b") & c.n.str.contains(rf"\b{first}\b")]
                      if len(nn.split()) > 1 else c[c.n.str.split().str[0] == nn])
                if m3.player_id.nunique() == 1:
                    m = m3
        if not m.empty:
            s = (m.groupby("season_name")
                 .agg(apps=("nb_on_pitch", "sum"), g=("goals", "sum"), a=("assists", "sum"),
                      cs=("clean_sheets", "sum"), gc=("goals_conceded", "sum"))
                 .fillna(0).to_dict("records"))
            o["seasons"] = s
            o["tot"] = {k: sum(x[k] for x in s) for k in ["apps", "g", "a", "cs", "gc"]}
        players.append(o)

    def peak(vals):
        vals = sorted(vals, reverse=True)[:2]
        return sum(vals) / len(vals) if vals else None

    for o in players:
        g = GROUP.get(o["main"])
        if not g or "seasons" not in o or o["tot"]["apps"] == 0:
            continue
        q = [s for s in o["seasons"] if s["apps"] >= 10] or o["seasons"]
        per = lambda s: max(s["apps"], 1)
        if g == "ATT":
            o["pk"] = peak([(s["g"] + 0.6 * s["a"]) / per(s) for s in q])
        elif g == "MID":
            o["pk"] = peak([(s["g"] + s["a"]) / per(s) for s in q])
        else:
            o["pk"] = peak([(s["cs"] - 0.35 * s["gc"]) / per(s) for s in q])
        o["group"], o["lon"] = g, math.log1p(o["tot"]["apps"])

    for g, w0 in WEIGHT.items():
        grp = [o for o in players if o.get("group") == g]
        pk = np.array([o["pk"] for o in grp]); lon = np.array([o["lon"] for o in grp])
        z = 0.8 * (pk - pk.mean()) / pk.std() + 0.2 * (lon - lon.mean()) / lon.std()
        rank = z.argsort().argsort() / (len(z) - 1)
        manual = np.sort([o["rating"] for o in grp])
        for o, qv in zip(grp, rank):
            stat = float(np.quantile(manual, qv))
            d = w0 * min(1, o["tot"]["apps"] / 60) * (stat - o["rating"])
            lo = 0 if g == "MID" else -3
            o["delta"] = int(round(o["rating"] + max(lo, min(4, d)))) - o["rating"]

    lookup = {(o["club"], o["era"], o["name"]): o for o in players}
    out, club = [], None
    for line in base_text.split("\n"):
        mc = re.match(r"\s+([A-Z]{3}): \{ name:", line)
        if mc:
            club = mc.group(1)
        me = re.match(r'\s+"(\d0s)": \[', line)
        if me:
            era = me.group(1)

            def repl(mm):
                o = lookup[(club, era, mm.group(1))]
                d = o.get("delta", 0)
                lst = ",".join(f"{p}:{r + d}" for p, r in o["opts"])
                if "tot" not in o:
                    return f'"{o["name"]}|{lst}"'
                t = o["tot"]
                st = (f"M:{int(t['apps'])},CS:{int(t['cs'])}" if o["main"] == "GK"
                      else f"M:{int(t['apps'])},G:{int(t['g'])},A:{int(t['a'])}")
                return f'"{o["name"]}|{lst}|{st}"'
            line = re.sub(r'"([^"|]+)\|([A-Z:0-9,]+)"', repl, line)
        out.append(line)

    header = ("// Go Invincible — player database (generated by tools/build_ratings.py, do not edit by hand)\n"
              "// Format: \"Name|POS:RATING,...|M:apps,G:goals,A:assists\" (goalkeepers: M:apps,CS:clean sheets)\n"
              "// First position is the natural one. Stats are Premier League totals for that club in that era,\n"
              "// from Transfermarkt data via github.com/salimt/football-datasets.\n")
    body = "\n".join(out)
    body = body[body.index("const DATA"):]
    (ROOT / "js/data.js").write_text(header + body)
    matched = sum("tot" in o for o in players)
    changed = sum(o.get("delta", 0) != 0 for o in players)
    print(f"{len(players)} players, {matched} matched to stats, {changed} ratings adjusted -> js/data.js")


if __name__ == "__main__":
    main()
