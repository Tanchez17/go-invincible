// Go Invincible — season engine
const FORMATION = ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "LW", "ST", "RW"];
const CAT = { GK: "GK", LB: "DEF", CB: "DEF", RB: "DEF", CM: "MID", LW: "FWD", ST: "FWD", RW: "FWD" };

// 19 league opponents (generic strength, not real clubs)
const OPPONENTS = [
  ["Title Rivals", 89], ["Champions League Side", 87], ["Big Club", 86], ["European Hopefuls", 84],
  ["Top-Half Regulars", 82], ["Dark Horses", 81], ["Solid Mid-Table", 80], ["Awkward Away Day", 80],
  ["Cup Specialists", 79], ["Long-Ball Merchants", 78], ["Plucky Upstarts", 77], ["Yo-Yo Club", 76],
  ["Mid-Table Mediocrity", 76], ["Park-The-Bus FC", 75], ["Relegation Scrappers", 74], ["Newly Promoted", 73],
  ["Survival Specialists", 72], ["Crisis Club", 71], ["Rock Bottom Rovers", 69]
];

const avg = a => a.reduce((s, x) => s + x, 0) / a.length;

function teamStrength(players) {
  // players: [{pos, rating}] of length 11
  const by = c => players.filter(x => CAT[x.pos] === c).map(x => x.rating);
  const gk = avg(by("GK")), df = avg(by("DEF")), md = avg(by("MID")), fw = avg(by("FWD"));
  const weakest = Math.min(...players.map(p => p.rating));
  // a weak link hurts more than its share of the average (non-linear)
  const weakPenalty = Math.max(0, 80 - weakest) * 0.12;
  const att = 0.55 * fw + 0.35 * md + 0.10 * df - weakPenalty;
  const def = 0.25 * gk + 0.50 * df + 0.25 * md - weakPenalty;
  return { att, def, ovr: (att + def) / 2 };
}

function poisson(lambda, rng) {
  const L = Math.exp(-lambda); let k = 0, p = 1;
  do { k++; p *= rng(); } while (p > L);
  return k - 1;
}

const K = 7;            // how strongly rating gaps turn into goals
const BASE_FOR = 1.5;   // your expected goals vs an equal side
const BASE_AGAINST = 1.35;
const HOME = 0.18;

function simulateSeason(players, rng = Math.random) {
  const s = teamStrength(players);
  const fixtures = [];
  OPPONENTS.forEach(([name, r]) => { fixtures.push({ name, r, home: true }); fixtures.push({ name, r, home: false }); });
  // shuffle fixture order
  for (let i = fixtures.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [fixtures[i], fixtures[j]] = [fixtures[j], fixtures[i]]; }
  let w = 0, d = 0, l = 0, gf = 0, ga = 0;
  const results = fixtures.map(f => {
    const form = (rng() - 0.5) * 5; // match-day variance
    const lf = BASE_FOR * Math.exp((s.att + form - f.r) / K) * (f.home ? 1 + HOME : 1 - HOME / 2);
    const la = BASE_AGAINST * Math.exp((f.r - s.def - form) / K) * (f.home ? 1 - HOME / 2 : 1 + HOME);
    const a = poisson(lf, rng), b = poisson(la, rng);
    gf += a; ga += b;
    const res = a > b ? "W" : a === b ? "D" : "L";
    if (res === "W") w++; else if (res === "D") d++; else l++;
    return { opp: f.name, home: f.home, for: a, against: b, res };
  });
  return { w, d, l, gf, ga, pts: w * 3 + d, results, strength: s };
}

if (typeof module !== "undefined") module.exports = { FORMATION, OPPONENTS, teamStrength, simulateSeason };
