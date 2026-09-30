// Go Invincible — UI: spins, draft, pitch and results
const ERA_KEYS = Object.keys(DATA.eras);
const COMBOS = [];
for (const [code, club] of Object.entries(DATA.clubs)) for (const era of Object.keys(club.eras)) COMBOS.push({ code, era });
const POS_NAME = { GK: "Goalkeeper", LB: "Left back", CB: "Centre back", RB: "Right back", CM: "Central midfield", LW: "Left wing", ST: "Striker", RW: "Right wing" };
const players = (code, era) => DATA.clubs[code].eras[era].map(s => {
  const [name, list, st] = s.split("|");
  const stats = st ? Object.fromEntries(st.split(",").map(x => x.split(":")).map(([k, v]) => [k, +v])) : null;
  const opts = list.split(",").map(x => { const [pos, r] = x.split(":"); return { pos, rating: +r }; });
  return { name, main: opts[0].pos, opts, code, era, stats };
});
// where a player lines up by default: his natural position if free, otherwise his best-rated open position
function defaultSpot(p, open) {
  const fit = p.opts.filter(o => open.has(o.pos));
  return fit.find(o => o.pos === p.main) || fit.sort((a, b) => b.rating - a.rating)[0];
}
const POS_XY = [[50, 89], [13, 68], [37, 73], [63, 73], [87, 68], [20, 46], [50, 50], [80, 46], [17, 20], [50, 15], [83, 20]];
const app = document.getElementById("app");
const rnd = a => a[Math.floor(Math.random() * a.length)];
const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const surname = n => n.split(" ").slice(-1)[0];

let S = null;
function newGame(mode) {
  S = { mode, slots: FORMATION.map(pos => ({ pos, p: null })), club: null, era: null, clubRerolls: 2, eraRerolls: 2, spinning: false, note: "", justFilled: -1, choosing: null, result: null };
  render();
}
const openPositions = () => new Set(S.slots.filter(s => !s.p).map(s => s.pos));
const pickedNames = () => new Set(S.slots.filter(s => s.p).map(s => s.p.name));
function pool() {
  if (!S.club) return [];
  const open = openPositions(), taken = pickedNames();
  return players(S.club, S.era).filter(p => p.opts.some(o => open.has(o.pos)) && !taken.has(p.name))
    .map(p => ({ ...p, spot: defaultSpot(p, open) }))
    .sort((a, b) => FORMATION.indexOf(a.spot.pos) - FORMATION.indexOf(b.spot.pos) || b.spot.rating - a.spot.rating);
}
const filled = () => S.slots.filter(s => s.p).length;

function spin(which) {
  if (S.spinning) return;
  S.spinning = which; S.note = ""; render();
  const clubs = Object.keys(DATA.clubs);
  let ticks = 0;
  const t = setInterval(() => {
    ticks++;
    if (which !== "era") S.club = rnd(clubs);
    if (which !== "club") S.era = rnd(ERA_KEYS);
    renderReels();
    if (ticks >= 12) {
      clearInterval(t);
      const nonEmpty = (a, b) => a.length ? a : b;
      let tries = 0, ok = false;
      while (tries++ < 60) {
        if (which === "both") { const c = rnd(COMBOS); S.club = c.code; S.era = c.era; }
        else if (which === "club") { S.club = rnd(nonEmpty(clubs.filter(c => DATA.clubs[c].eras[S.era] && c !== S.lastClub), clubs.filter(c => DATA.clubs[c].eras[S.era]))); }
        else { const es = Object.keys(DATA.clubs[S.club].eras); S.era = rnd(nonEmpty(es.filter(e => e !== S.lastEra), es)); }
        if (DATA.clubs[S.club].eras[S.era] && pool().length) { ok = true; break; }
      }
      if (!ok) {
        const good = COMBOS.filter(c => { S.club = c.code; S.era = c.era; return pool().length; });
        const c = rnd(good); S.club = c.code; S.era = c.era;
        S.note = "Nobody from that spin fits your open positions, so the wheel went again.";
      }
      S.lastClub = S.club; S.lastEra = S.era; S.spinning = false;
      render();
    }
  }, 70);
}
function reroll(kind) {
  if (S.choosing) return;
  if (kind === "club" && S.clubRerolls > 0) { S.clubRerolls--; spin("club"); }
  if (kind === "era" && S.eraRerolls > 0) { S.eraRerolls--; spin("era"); }
}
function placePlayer(p, pos) {
  const idx = S.slots.findIndex(s => !s.p && s.pos === pos);
  if (idx < 0) return;
  const o = p.opts.find(x => x.pos === pos);
  S.slots[idx].p = { name: p.name, code: p.code, era: p.era, main: p.main, pos, rating: o.rating };
  S.justFilled = idx; S.club = null; S.era = null; S.choosing = null;
  if (filled() === 11) S.result = simulateSeason(S.slots.map(s => s.p));
  render();
}
function pickPlayer(i) {
  const p = pool()[i]; if (!p) return;
  const open = openPositions();
  if (open.has(p.main)) return placePlayer(p, p.main);
  const options = p.opts.filter(o => open.has(o.pos));
  if (options.length > 1) { S.choosing = { p, options }; render(); }
  else placePlayer(p, options[0].pos);
}

function statLine(p) {
  const t = p.stats;
  if (!t) return "";
  return t.CS !== undefined ? `${t.M} apps, ${t.CS} clean sheets` : `${t.M} apps, ${t.G} goals, ${t.A} assists`;
}
function reelsHTML() {
  const c = S.club ? DATA.clubs[S.club] : null;
  const canReroll = S.club && !S.spinning && !S.choosing;
  return `<div class="reels">
    <div class="reel ${S.spinning ? "spinning" : ""}">
      <div class="lbl">Club <button class="reroll" id="rc" ${canReroll && S.clubRerolls ? "" : "disabled"} aria-label="Re-spin club, ${S.clubRerolls} left">↻ ${S.clubRerolls}</button></div>
      <div class="val" id="rv-club">${c ? esc(c.name) : "—"}</div></div>
    <div class="reel ${S.spinning ? "spinning" : ""}">
      <div class="lbl">Era <button class="reroll" id="re" ${canReroll && S.eraRerolls ? "" : "disabled"} aria-label="Re-spin era, ${S.eraRerolls} left">↻ ${S.eraRerolls}</button></div>
      <div class="val" id="rv-era">${S.era ? S.era : "—"}</div><div class="sub" id="rv-sub">${S.era ? DATA.eras[S.era] : ""}</div></div>
  </div>`;
}
function renderReels() {
  const c = S.club && DATA.clubs[S.club];
  const a = document.getElementById("rv-club"), b = document.getElementById("rv-era"), d = document.getElementById("rv-sub");
  if (a) a.textContent = c ? c.name : "—";
  if (b) b.textContent = S.era || "—";
  if (d) d.textContent = S.era ? DATA.eras[S.era] : "";
}
function kitSVG(label) {
  return `<svg class="kit" viewBox="0 0 44 42" aria-hidden="true">
    <path class="sleeve" d="M13 4 L3 11 L7 20 L13 17 Z"/><path class="sleeve" d="M31 4 L41 11 L37 20 L31 17 Z"/>
    <path class="body" d="M13 4 Q17 8 22 8 Q27 8 31 4 L31 39 L13 39 Z"/>
    <text x="22" y="28" text-anchor="middle">${label}</text></svg>`;
}
function pitchHTML(reveal) {
  const lines = `<svg class="lines" viewBox="0 0 100 117" preserveAspectRatio="none" aria-hidden="true" fill="none" stroke="#db0007" stroke-opacity=".35" stroke-width=".6">
    <rect x="3" y="3" width="94" height="111"/><path d="M36 3 a14 12 0 0 0 28 0"/><rect x="24" y="3" width="52" height="16"/>
    <rect x="22" y="96" width="56" height="18"/><rect x="38" y="108" width="24" height="6"/><path d="M40 96 a10 7 0 0 1 20 0"/></svg>`;
  const showR = S.mode === "classic" || reveal;
  return `<div class="pitch">${lines}${S.slots.map((s, i) => {
    const [x, y] = POS_XY[i];
    if (!s.p) return `<div class="slot" style="left:${x}%;top:${y}%">${kitSVG(s.pos)}</div>`;
    return `<div class="slot filled ${i === S.justFilled ? "new" : ""}" style="left:${x}%;top:${y}%">
      ${kitSVG(showR ? s.p.rating : "")}<div class="pname">${esc(surname(s.p.name))}</div><div class="pmeta">${s.p.code} ${DATA.eras[s.p.era].slice(2, 4)}–${DATA.eras[s.p.era].slice(-2)}</div></div>`;
  }).join("")}</div>`;
}

function render() {
  if (!S) return renderStart();
  if (S.result) return renderResult();
  const n = filled(), pl = pool();
  const showR = S.mode === "classic";
  const open = openPositions();
  let mid = "";
  if (S.choosing) {
    const { p, options } = S.choosing;
    mid = `<div class="chooser">
      <div class="eyebrow">${esc(DATA.clubs[p.code].name)} · ${DATA.eras[p.era]}</div>
      <h3>Where does ${esc(p.name)} play?</h3>
      <p>His natural position (${p.main}) is taken. He can cover these open spots${showR ? ", at a slightly lower rating" : ""}.</p>
      <div class="opts">${options.map(o => `<button class="opt" data-pos="${o.pos}">${o.pos}${showR ? ` · ${o.rating}` : ""}<small>${POS_NAME[o.pos]}</small></button>`).join("")}</div>
      <button class="linkbtn" id="back">Pick someone else</button>
    </div>`;
  } else if (S.club && !S.spinning) {
    mid = `<div class="pool"><div class="pool-head">Sign one · ${esc(DATA.clubs[S.club].name)} ${DATA.eras[S.era]}</div>
      ${pl.map((p, i) => `<button class="pick" data-i="${i}">
        <span class="poss"><span class="pos ${p.spot.pos === p.main ? "" : "alt"}">${p.spot.pos}</span></span>
        <span class="name">${esc(p.name)}<span class="natural">${[p.spot.pos === p.main ? "" : `Natural ${p.main}`, showR ? statLine(p) : ""].filter(Boolean).join(" · ")}</span></span>${showR ? `<span class="rating">${p.spot.rating}</span>` : "<span></span>"}</button>`).join("")}</div>`;
  }
  app.innerHTML = `<section style="display:grid;gap:14px">
    <div class="round"><div class="big">Signing <span>${Math.min(n + 1, 11)}</span> of 11</div><div class="meta">${S.mode === "classic" ? "Classic" : "Ball Knowledge"} · 4-3-3</div></div>
    ${reelsHTML()}
    ${S.club || S.spinning ? "" : `<button class="spinbtn" id="spin">Spin</button>`}
    ${S.note ? `<div class="note">${S.note}</div>` : ""}
    ${mid}
    ${pitchHTML(false)}
  </section>`;
  const on = (id, f) => { const e = document.getElementById(id); if (e) e.onclick = f; };
  on("spin", () => spin("both")); on("rc", () => reroll("club")); on("re", () => reroll("era"));
  on("back", () => { S.choosing = null; render(); });
  app.querySelectorAll(".pick").forEach(b => b.onclick = () => pickPlayer(+b.dataset.i));
  app.querySelectorAll(".opt").forEach(b => b.onclick = () => placePlayer(S.choosing.p, b.dataset.pos));
  S.justFilled = -1;
}

function renderStart() {
  app.innerHTML = `<section class="intro">
    <div class="eyebrow">The 2003–04 challenge</div>
    <h2>Arsenal went a whole season unbeaten. <em>Can your eleven?</em></h2>
    <p>Spin a club and an era, sign one player, and repeat until you have a full 4-3-3. Then play a 38-game Premier League season.</p>
    <ol class="howto">
      <li><b>1</b><span>Each spin lands on a club and an era, like Chelsea in the 2000s. Sign one player who fits an open position.</span></li>
      <li><b>2</b><span>Players line up in their natural position. If it's taken, many can cover another spot at a slightly lower rating.</span></li>
      <li><b>3</b><span>You get two club re-spins and two era re-spins for the whole draft.</span></li>
      <li><b>4</b><span>Zero losses makes you Invincible. 38-0-0 is perfection.</span></li>
    </ol>
  </section>
  <div class="modes">
    <button class="mode primary" id="m1"><strong>Classic</strong><small>Ratings visible. Make informed picks.</small></button>
    <button class="mode" id="m2"><strong>Ball Knowledge</strong><small>Ratings hidden until the season is over.</small></button>
  </div>`;
  document.getElementById("m1").onclick = () => newGame("classic");
  document.getElementById("m2").onclick = () => newGame("blind");
}

function shareText(r) {
  const tag = r.w === 38 ? "PERFECT SEASON" : r.l === 0 ? "INVINCIBLE" : `${r.pts} pts`;
  const grid = r.results.map(x => x.res === "W" ? "🟩" : x.res === "D" ? "🟨" : "🟥");
  return `GO INVINCIBLE ⚽ ${r.w}-${r.d}-${r.l} · ${tag}\n${grid.slice(0, 19).join("")}\n${grid.slice(19).join("")}\nXI: ${S.slots.map(s => surname(s.p.name)).join(", ")}`;
}

function renderResult() {
  const r = S.result, inv = r.l === 0;
  const badge = r.w === 38 ? "Perfect season" : inv ? "Invincible" : r.l <= 2 ? "So close" : r.pts >= 90 ? "Champions, but beaten" : "Back to the drawing board";
  const gd = r.gf - r.ga;
  const line = inv ? `Unbeaten in all 38. ${r.pts} points, ${r.gf} goals scored.` : `Beaten ${r.l} time${r.l > 1 ? "s" : ""}. ${r.pts} points, goal difference ${gd >= 0 ? "+" : ""}${gd}.`;
  app.innerHTML = `<section style="display:grid;gap:16px">
    <div class="verdict ${inv ? "inv" : ""}">
      <div class="badge">${badge}</div>
      <div class="record">${r.w}-${r.d}-${r.l}</div>
      <div class="record-key">W · D · L</div>
      <div class="line">${line}</div>
    </div>
    <div class="strip" aria-label="Season results in order">${r.results.map(x => `<div class="cell ${x.res}" title="${x.home ? "vs" : "@"} ${esc(x.opp)} ${x.for}-${x.against}">${x.res}</div>`).join("")}</div>
    <div class="statrow">
      <div class="stat"><span>Points</span><b>${r.pts}</b></div>
      <div class="stat"><span>Goals</span><b>${r.gf}–${r.ga}</b></div>
      <div class="stat"><span>Attack</span><b>${r.strength.att.toFixed(1)}</b></div>
      <div class="stat"><span>Defence</span><b>${r.strength.def.toFixed(1)}</b></div>
    </div>
    ${pitchHTML(true)}
    <textarea class="sharebox" id="sharebox" rows="5" readonly hidden>${esc(shareText(r))}</textarea>
    <div class="actions">
      <button class="ghost" id="copy">Copy result</button>
      <button class="spinbtn" id="again" style="font-size:20px;padding:14px">New draft</button>
    </div>
    <details><summary>All 38 fixtures</summary><div class="fixtures">
      ${r.results.map((x, i) => `<div class="fx"><span class="md">${String(i + 1).padStart(2, "0")}</span><span>${x.home ? "vs" : "@"} ${esc(x.opp)}</span><span class="num">${x.for}–${x.against}</span><span class="r ${x.res}">${x.res}</span></div>`).join("")}
    </div></details>
  </section>`;
  document.getElementById("again").onclick = () => { S = null; render(); window.scrollTo(0, 0); };
  const copy = document.getElementById("copy");
  copy.onclick = () => {
    const box = document.getElementById("sharebox");
    const fallback = () => { box.hidden = false; box.select(); copy.textContent = "Press Ctrl/⌘+C"; };
    const done = () => { copy.textContent = "Copied"; setTimeout(() => copy.textContent = "Copy result", 1500); };
    try { navigator.clipboard.writeText(box.value).then(done, fallback); } catch (e) { fallback(); }
  };
}

render();
