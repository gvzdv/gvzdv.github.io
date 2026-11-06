/* Mike Gvozdev, annual report 2026: plates after Erik Nitsche, page turns, editions */
(() => {
"use strict";
const root = document.documentElement;
const darkMQ = matchMedia('(prefers-color-scheme: dark)');
const motionMQ = matchMedia('(prefers-reduced-motion: reduce)');
const deskMQ = matchMedia('(min-width: 960px)');
const isDark = () => { const t = root.getAttribute('data-theme'); return t ? t === 'dark' : darkMQ.matches; };
const motionOK = () => !motionMQ.matches;

/* ---------- small utilities ---------- */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hex = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
const toHex = a => '#' + a.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
const shade = (h, f) => toHex(hex(h).map(v => v * f));
const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; };
function vgrad(c, y0, y1, stops) { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function hgrad(c, x0, x1, stops) { const g = c.createLinearGradient(x0, 0, x1, 0); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function dust(c, W, H, R, n, maxY) { for (let i = 0; i < n; i++) { c.fillStyle = `rgba(215,228,242,${.08 + R() * .34})`; const s = R() * 1.1 + .3; c.fillRect(R() * W, R() * H * (maxY || 1), s, s); } }

const KINDS = {};

/* ---------- PLATE I: applied ai (after "basic forces") ---------- */
KINDS.forces = {
  focus: .45,
  bg(c, W, H, dark, R, st) {
    const sx = W * .5, sy = H * .47, sr = Math.min(W * .115, H * .085);
    c.fillStyle = dark
      ? vgrad(c, 0, H, [[0, '#050b14'], [.42, '#0a1624'], [.62, '#0d1b2a'], [1, '#060d16']])
      : vgrad(c, 0, H, [[0, '#262d3a'], [.22, '#393d48'], [.42, '#5b554f'], [.52, '#6c6459'], [.62, '#78786a'], [.82, '#899578'], [1, '#93a082']]);
    c.fillRect(0, 0, W, H);
    if (dark) {
      const g = c.createRadialGradient(sx, sy, 0, sx, sy, H * .58); g.addColorStop(0, 'rgba(120,150,186,.17)'); g.addColorStop(1, 'rgba(120,150,186,0)');
      c.fillStyle = g; c.fillRect(0, 0, W, H); dust(c, W, H, R, 260, .75);
    } else {
      const g = c.createRadialGradient(sx, H * .5, 0, sx, H * .5, W * .95); g.addColorStop(0, 'rgba(150,112,88,.34)'); g.addColorStop(1, 'rgba(150,112,88,0)');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
    // constellations
    const stars = []; let tries = 0;
    while (stars.length < 36 && tries++ < 3000) {
      const x = R() * W * 1.04 - W * .02, y = H * (.035 + Math.pow(R(), 1.2) * .47);
      if (Math.hypot(x - sx, y - sy) < sr * 1.9) continue;
      if (stars.some(s => Math.hypot(s.x - x, s.y - y) < W * .065)) continue;
      const b = R(); stars.push({ x, y, r: b > .76 ? W * .0072 : b > .36 ? W * .0052 : W * .0034 });
    }
    st.stars = stars;
    const maxL = W * .3, seen = new Set();
    c.beginPath();
    stars.forEach((s, i) => {
      const near = stars.map((o, j) => ({ j, d: Math.hypot(o.x - s.x, o.y - s.y) })).filter(o => o.j !== i).sort((a, b) => a.d - b.d);
      const link = n => { const k = i < n.j ? i + '-' + n.j : n.j + '-' + i; if (seen.has(k) || n.d > maxL) return; seen.add(k); c.moveTo(s.x, s.y); c.lineTo(stars[n.j].x, stars[n.j].y); };
      if (near[0]) link(near[0]); if (near[1] && R() < .42) link(near[1]);
    });
    for (let i = 0; i < 5; i++) { const s = stars[Math.floor(R() * stars.length)]; const a = R() * TAU; c.moveTo(s.x, s.y); c.lineTo(s.x + Math.cos(a) * W, s.y + Math.sin(a) * W * .6); }
    c.lineWidth = dark ? .8 : Math.max(1, W * .0016);
    c.strokeStyle = dark ? 'rgba(170,192,222,.24)' : 'rgba(146,156,178,.55)';
    c.stroke();
    stars.forEach(s => {
      c.beginPath(); c.arc(s.x, s.y, s.r, 0, TAU); c.fillStyle = dark ? '#f4f6f9' : '#ece5d1';
      if (dark) { c.shadowColor = 'rgba(220,236,255,.9)'; c.shadowBlur = s.r * 3; }
      c.fill(); c.shadowBlur = 0;
    });
    // the sun with its red core
    if (dark) {
      const g = c.createRadialGradient(sx, sy, sr * .9, sx, sy, sr * 3.3); g.addColorStop(0, 'rgba(255,238,215,.46)'); g.addColorStop(1, 'rgba(255,238,215,0)');
      c.fillStyle = g; c.beginPath(); c.arc(sx, sy, sr * 3.3, 0, TAU); c.fill();
    }
    let g = c.createRadialGradient(sx - sr * .2, sy - sr * .25, 0, sx, sy, sr);
    g.addColorStop(0, dark ? '#fbf6ec' : '#f6f0df'); g.addColorStop(1, dark ? '#efe6d4' : '#e9e0c9');
    c.fillStyle = g; c.beginPath(); c.arc(sx, sy, sr, 0, TAU); c.fill();
    g = c.createRadialGradient(sx, sy, 0, sx, sy, sr * .5);
    g.addColorStop(0, '#b0140e'); g.addColorStop(.42, '#d3261a'); g.addColorStop(.72, 'rgba(232,96,62,.72)'); g.addColorStop(1, 'rgba(240,150,110,0)');
    c.fillStyle = g; c.beginPath(); c.arc(sx, sy, sr * .5, 0, TAU); c.fill();
    c.lineWidth = Math.max(.6, sr * .012);
    for (let i = 1; i < 7; i++) { c.strokeStyle = `rgba(255,222,204,${.11 - i * .012})`; c.beginPath(); c.arc(sx, sy, sr * .06 * i + sr * .04, 0, TAU); c.stroke(); }
  },
  init(W, H, dark, R) {
    const waves = [], n = 15;
    for (let i = 0; i < n; i++) {
      const p = i / (n - 1);
      waves.push({ y: H * (.56 + Math.pow(p, 1.1) * .43), amp: H * (.006 + R() * .022) * (.55 + p * .9), k: W * (.45 + R() * 1.1), k2: W * (.25 + R() * .5),
        ph: R() * TAU, ph2: R() * TAU, sp: (.06 + R() * .12) * (R() < .5 ? -1 : 1), p, dot: R() < .45 });
    }
    return { waves };
  },
  fg(c, W, H, dark, t, st, still, P) {
    const step = Math.max(4, W / 160), a = P ? P.a : 0, rp = W * .19, lam = W * .07, A0 = H * .022 * a;
    for (const w of st.waves) {
      c.beginPath();
      let first = true;
      for (let x = -step; x <= W + step; x += step) {
        let y = w.y + w.amp * Math.sin(x / w.k * TAU + w.ph + t * w.sp) + w.amp * .45 * Math.sin(x / w.k2 * TAU + w.ph2 - t * w.sp * .7);
        if (a > .01) { const dx = x - P.x, dy = w.y - P.y, d2 = dx * dx + dy * dy; if (d2 < 9 * rp * rp) { const d = Math.sqrt(d2); y += A0 * Math.exp(-d2 / (2 * rp * rp)) * Math.sin(TAU * d / lam - t * 5); } }
        if (first) { c.moveTo(x, y); first = false; } else c.lineTo(x, y);
      }
      if (dark) { c.strokeStyle = `rgba(196,212,228,${.1 + w.p * .27})`; c.lineWidth = w.dot ? 1.3 : .7; c.setLineDash(w.dot ? [1, 4.5] : []); }
      else { c.strokeStyle = `rgba(30,34,31,${.3 + w.p * .52})`; c.lineWidth = Math.max(1, W * (.0016 + w.p * .0016)); const d = W * (.011 + w.p * .006); c.setLineDash([d, d * .62]); }
      c.lineDashOffset = -t * 12 * Math.sign(w.sp);
      c.stroke();
    }
    c.setLineDash([]);
    // the pointer joins the constellation as one more star
    if (a > .01 && st.stars) {
      const R0 = W * .3, rgb = dark ? '196,214,238' : '241,234,215', near = [];
      for (const s of st.stars) { const d = Math.hypot(s.x - P.x, s.y - P.y); if (d < R0) near.push([d, s]); }
      near.sort((u, v) => u[0] - v[0]);
      let wmax = 0;
      c.lineWidth = dark ? .9 : Math.max(1, W * .0018);
      near.slice(0, 4).forEach(([d, s], i) => {
        const wgt = a * Math.pow(1 - d / R0, 1.2); wmax = Math.max(wmax, wgt);
        c.strokeStyle = `rgba(${rgb},${(.8 * wgt).toFixed(3)})`;
        c.beginPath(); c.moveTo(P.x, P.y); c.lineTo(s.x, s.y); c.stroke();
        c.strokeStyle = `rgba(${rgb},${(.55 * wgt).toFixed(3)})`;
        c.beginPath(); c.arc(s.x, s.y, s.r * (2 + .35 * Math.sin(t * 3 + i * 1.7)), 0, TAU); c.stroke();
      });
      if (wmax > .01) {
        c.fillStyle = `rgba(${rgb},${Math.min(1, wmax * 1.3).toFixed(3)})`;
        if (dark) { c.shadowColor = 'rgba(220,236,255,.9)'; c.shadowBlur = 8; }
        c.beginPath(); c.arc(P.x, P.y, W * .0058, 0, TAU); c.fill(); c.shadowBlur = 0;
      }
    }
  }
};

/* ---------- PLATE II: architecture (after "nuclear fusion") ---------- */
KINDS.fusion = {
  focus: .45,
  init(W, H) { return { cx: W * .5, by: H * .385, bw: W * .21, bh: H * .062, rw: W * .21 * .33, lean: 0, press: 0 }; },
  bg(c, W, H, dark, R, st) {
    const { cx, by, bw, bh, rw } = st;
    if (!dark) {
      const N = Math.max(34, Math.round(H / 18)), bandH = H / N;
      const ramp = [[0, '#1d2429'], [.1, '#323b40'], [.2, '#555e60'], [.3, '#757c79'], [.4, '#8a928c'], [.5, '#86a08f'], [.6, '#93ad9b'], [.7, '#6f9a85'], [.8, '#7fa792'], [.9, '#5f8f7a'], [1, '#8aa898']];
      const jit = ['#6b7d88', '#8b8a86', '#5c8a76', '#a2b6a8', '#6f7a8b', '#7d8f84', '#4f7f6c'];
      const at = p => { for (let i = 1; i < ramp.length; i++) if (p <= ramp[i][0]) { const [p0, c0] = ramp[i - 1], [p1, c1] = ramp[i]; return mix(c0, c1, (p - p0) / (p1 - p0)); } return ramp[ramp.length - 1][1]; };
      for (let i = 0; i < N; i++) {
        const col = mix(at(i / (N - 1)), jit[Math.floor(R() * jit.length)], .15 + R() * .3);
        c.fillStyle = hgrad(c, 0, W, [[0, shade(col, .85)], [.3 + R() * .2, shade(col, 1.05)], [.7 + R() * .1, shade(col, .98)], [1, shade(col, .84)]]);
        c.fillRect(0, i * bandH, W, bandH + 1);
      }
      c.strokeStyle = 'rgba(22,28,26,.86)'; c.lineWidth = Math.max(1, W * .0021);
      c.beginPath(); for (let i = 1; i < N; i++) { const y = Math.round(i * bandH) + .5; c.moveTo(0, y); c.lineTo(W, y); } c.stroke();
      const wash = c.createRadialGradient(cx, H * .55, 0, cx, H * .55, W * .95); wash.addColorStop(0, 'rgba(255,255,255,.08)'); wash.addColorStop(1, 'rgba(0,0,0,.14)');
      c.fillStyle = wash; c.fillRect(0, 0, W, H);
    } else {
      c.fillStyle = vgrad(c, 0, H, [[0, '#050c15'], [.4, '#0a1724'], [.6, '#0b1a27'], [1, '#050c15']]); c.fillRect(0, 0, W, H);
      const glow = c.createRadialGradient(cx, by + bh, 0, cx, by + bh, W * .78);
      glow.addColorStop(0, 'rgba(150,200,222,.3)'); glow.addColorStop(.5, 'rgba(90,140,170,.08)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = glow; c.fillRect(0, 0, W, H);
      const N = Math.max(30, Math.round(H / 24));
      for (let i = 1; i < N; i++) {
        const y = H * (.13 + .78 * i / N), d = Math.abs(y - (by + bh)) / H, a = clamp(.44 - d * 1.1, .05, .44);
        c.strokeStyle = hgrad(c, 0, W, [[0, 'rgba(120,175,195,0)'], [.5, `rgba(140,192,208,${a})`], [1, 'rgba(120,175,195,0)']]);
        c.lineWidth = .8 + R() * .6; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
      }
      c.strokeStyle = hgrad(c, 0, W, [[0, 'rgba(180,220,235,0)'], [.5, 'rgba(205,236,246,.75)'], [1, 'rgba(180,220,235,0)']]);
      c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, by + bh + .5); c.lineTo(W, by + bh + .5); c.stroke();
    }
    if (dark) { c.shadowColor = 'rgba(230,240,250,.65)'; c.shadowBlur = W * .06; }
    c.fillStyle = dark ? '#e8ecef' : '#e6e4dc'; c.fillRect(cx - bw / 2, by, bw, bh); c.shadowBlur = 0;
    if (dark) { c.shadowColor = 'rgba(240,40,30,.85)'; c.shadowBlur = W * .03; }
    c.fillStyle = dark ? '#e3261b' : '#c9221a'; c.fillRect(cx - rw / 2, by, rw, bh); c.shadowBlur = 0;
  },
  fg(c, W, H, dark, t, st, still, P) {
    const { cx, by, bw, bh, rw } = st, top = by + bh, bot = H * .83, a = P ? P.a : 0;
    // an inspection light runs across the bands at the pointer's height
    if (a > .01) {
      const band = H * .045;
      c.save(); c.globalCompositeOperation = dark ? 'screen' : 'soft-light';
      c.fillStyle = vgrad(c, P.y - band * 2, P.y + band * 2, [[0, 'rgba(255,255,255,0)'], [.5, `rgba(${dark ? '150,205,225' : '255,255,255'},${((dark ? .2 : .6) * a).toFixed(3)})`], [1, 'rgba(255,255,255,0)']]);
      c.fillRect(0, P.y - band * 2, W, band * 4); c.restore();
    }
    // the beam leans toward the pointer; the arrows press on the block as it comes near
    const lean = P ? a * clamp((P.x - cx) / (W * .45), -1, 1) * W * .15 : 0;
    const near = P ? a * clamp(1 - Math.hypot(P.x - cx, P.y - (by + bh / 2)) / (W * .38), 0, 1) : 0;
    st.lean += (lean - st.lean) * .25; st.press += (near - st.press) * .2;
    const L = st.lean, beam = (w0, w1) => { c.beginPath(); c.moveTo(cx - w0 / 2, top); c.lineTo(cx + w0 / 2, top); c.lineTo(cx + L + w1 / 2, bot); c.lineTo(cx + L - w1 / 2, bot); c.closePath(); };
    c.fillStyle = vgrad(c, top, bot, [[0, dark ? 'rgba(225,232,238,.3)' : 'rgba(236,234,226,.42)'], [1, 'rgba(236,234,226,0)']]);
    beam(bw, bw * 1.04); c.fill();
    c.fillStyle = vgrad(c, top, bot, [[0, dark ? 'rgba(227,38,27,.75)' : 'rgba(196,34,26,.72)'], [.7, 'rgba(196,34,26,.18)'], [1, 'rgba(196,34,26,0)']]);
    beam(rw, rw * 1.04); c.fill();
    const pr = st.press, ah = W * .075 * (1 + pr * .28), av = H * .055 * (1 - pr * .2), tip = H * .55 - (H * .55 - top - H * .016) * pr * .75, up = H * .19 + H * .05 * pr;
    c.strokeStyle = dark ? 'rgba(226,236,242,.85)' : '#1b2120'; c.lineWidth = dark ? 1 : Math.max(1.4, W * .0028);
    c.beginPath();
    c.moveTo(cx, up); c.lineTo(cx, by); c.moveTo(cx - ah, by - av); c.lineTo(cx, by); c.lineTo(cx + ah, by - av);
    c.moveTo(cx, H * .715); c.lineTo(cx, tip); c.moveTo(cx - ah, tip + av); c.lineTo(cx, tip); c.lineTo(cx + ah, tip + av);
    c.stroke();
  }
};

/* ---------- PLATE III: flight operations (after "first steps into space") ---------- */
// Three sails and a needle, traced from the poster on its 600 × 824 sheet. Every sail meets the others where the needle's
// body hands over to its harp; the lighter panels are the overlaps. Paths are runs of cubic segments.
const SHIP = {
  A: [[322, 66], [328, 170], [370, 285], [452, 351], [442, 385], [385, 505], [352, 560], [298, 492], [255, 425], [257, 370], [255, 290], [262, 160], [322, 66]],
  B: [[55, 236], [150, 200], [336, 298], [452, 351], [442, 385], [385, 505], [352, 560], [230, 520], [175, 290], [55, 236]],
  C: [[20, 397], [120, 378], [330, 384], [448, 358], [380, 400], [230, 560], [182, 672], [182, 560], [175, 445], [20, 397]],
  top: [[18, 398], [140, 338], [420, 335], [562, 370]],
  body: { x0: 257, x1: 452, xb: 415, yb0: 381, yb1: 382 },
  L: [18, 398], R: [562, 370]
};
const sheet = (W, H) => { const s = Math.min(W / 600, H / 824) * .98; return { s, ox: W / 2 - 290 * s, oy: H * .45 - 369 * s }; };
const at = (m, x, y) => [m.ox + x * m.s, m.oy + y * m.s];
function shipPath(c, m, seq) {
  c.beginPath(); const p = at(m, seq[0][0], seq[0][1]); c.moveTo(p[0], p[1]);
  for (let i = 1; i < seq.length; i += 3) { const a = at(m, ...seq[i]), b = at(m, ...seq[i + 1]), d = at(m, ...seq[i + 2]); c.bezierCurveTo(a[0], a[1], b[0], b[1], d[0], d[1]); }
  c.closePath();
}
const cubicAt = (p, t) => { const u = 1 - t; return [0, 1].map(i => u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]); };
// string art: lines from one point to evenly spaced points along a segment (clipped to the current region)
function fanLines(c, m, apex, from, to, n, style, w) {
  const A = at(m, apex[0], apex[1]);
  c.beginPath();
  for (let i = 0; i <= n; i++) { const t = -.05 + 1.1 * i / n, x = from[0] + (to[0] - from[0]) * t, y = from[1] + (to[1] - from[1]) * t, B = at(m, x + (x - apex[0]) * .15, y + (y - apex[1]) * .15); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); }
  c.strokeStyle = style; c.lineWidth = w; c.stroke();
}
// the needle's two harps: strings from each tip to the edge of the cream body
function needleStrings() {
  const out = [], n = 9, { L, R } = SHIP;
  for (let i = 0; i < n; i++) { const u = i / (n - 1), y = 350 + 31 * u; out.push({ a: L, q: [113 + 24 * u, 351 + 38 * u], b: [257, y], e: 0, ph: i * 1.7, w: i ? .55 : 1.5, o: i ? .55 + .3 * (1 - u) : 1 }); }
  for (let i = 0; i < n; i++) { const u = i / (n - 1); out.push({ a: [452 - 37 * u, 351 + 31 * u], q: [510 - 10 * u, 352 + 30 * u], b: R, e: 0, ph: i * 1.3 + .5, w: i ? .8 : 1.4, o: i ? .9 : 1 }); }
  return out;
}
function sailSprite(W, H, dark, dpr) {
  const cv = document.createElement('canvas'); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const m = sheet(W, H), lw = Math.max(.45, m.s * .5);
  const lg = (p0, p1, stops) => { const a = at(m, p0[0], p0[1]), b = at(m, p1[0], p1[1]), g = c.createLinearGradient(a[0], a[1], b[0], b[1]); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
  const fill = (k, style) => { shipPath(c, m, SHIP[k]); c.fillStyle = style; c.fill(); };
  const within = (keys, fn) => { c.save(); for (const k of keys) { shipPath(c, m, SHIP[k]); c.clip(); } fn(); c.restore(); };
  const all = style => { c.fillStyle = style; c.fillRect(0, 0, W, H); };
  const glow = (k, col) => { shipPath(c, m, SHIP[k]); c.save(); c.strokeStyle = col; c.lineWidth = 1.1; c.shadowColor = col; c.shadowBlur = 9; c.stroke(); c.restore(); };
  const V = [452, 351], Kb = [352, 560], T = [322, 66], Tb = [55, 236], Kc = [182, 672], K = [300, 492];
  if (!dark) {
    fill('B', lg(Tb, Kb, [[0, '#4d4f55'], [.55, '#43464c'], [1, '#30353a']]));
    fill('C', lg([90, 400], Kc, [[0, '#46494d'], [.45, '#3a4e56'], [1, '#2b5867']]));
    fill('A', lg(T, [330, 330], [[0, '#2f5d47'], [.6, '#254a3c'], [1, '#213f37']]));
    within(['A'], () => { fanLines(c, m, T, [250, 300], [460, 360], 70, 'rgba(210,240,222,.05)', lw); });
    within(['B'], () => { fanLines(c, m, Tb, V, Kb, 90, 'rgba(235,240,250,.035)', lw); });
    within(['C'], () => { fanLines(c, m, Kc, [20, 397], [448, 358], 120, 'rgba(210,235,245,.04)', lw); });
    // B over C: the blue-grey band
    within(['B', 'C'], () => {
      all(lg([160, 380], [300, 520], [[0, '#5d6a71'], [.5, '#566268'], [1, '#3b474d']]));
      const g = c.createRadialGradient(...at(m, 238, 455), 0, ...at(m, 238, 455), 70 * m.s); g.addColorStop(0, 'rgba(190,210,215,.28)'); g.addColorStop(1, 'rgba(190,210,215,0)'); all(g);
      fanLines(c, m, Kb, [150, 380], [300, 380], 70, 'rgba(225,238,242,.12)', lw);
    });
    // A over B: pale above the needle, a hatched grey below it
    within(['A', 'B'], () => {
      all(lg([300, 258], [330, 560], [[0, '#a99f8e'], [.33, '#9a9081'], [.45, '#77726b'], [1, '#55524e']]));
      fanLines(c, m, V, [258, 240], [258, 352], 110, 'rgba(250,244,230,.3)', lw * .9);
      fanLines(c, m, Kb, [290, 382], [470, 352], 110, 'rgba(240,236,226,.24)', lw * .9);
    });
    // all three: the lightest panel
    within(['A', 'C'], () => {
      all(lg([300, 380], K, [[0, '#d2d2c4'], [.6, '#bfc0b2'], [1, '#a4a698']]));
      fanLines(c, m, K, [240, 381], [440, 362], 120, 'rgba(255,255,250,.34)', lw * .9);
    });
  } else {
    fill('B', 'rgba(110,140,175,.12)'); fill('C', 'rgba(60,125,165,.16)'); fill('A', 'rgba(50,160,120,.16)');
    within(['B', 'C'], () => { all('rgba(130,180,210,.1)'); fanLines(c, m, Kb, [150, 380], [300, 380], 60, 'rgba(160,210,235,.1)', .6); });
    within(['A', 'B'], () => { all('rgba(200,222,236,.08)'); fanLines(c, m, V, [258, 240], [258, 352], 90, 'rgba(220,236,246,.24)', .6); fanLines(c, m, Kb, [290, 382], [470, 352], 90, 'rgba(220,236,246,.18)', .6); });
    within(['A', 'C'], () => { all('rgba(220,236,246,.14)'); fanLines(c, m, K, [240, 381], [440, 362], 90, 'rgba(230,242,250,.3)', .6); });
    glow('B', 'rgba(170,200,230,.5)'); glow('C', 'rgba(120,190,230,.55)'); glow('A', 'rgba(120,230,190,.6)');
  }
  // the needle's cream body, under the arc of its top edge
  const bd = SHIP.body, arc = [];
  for (let i = 0; i <= 80; i++) { const p = cubicAt(SHIP.top, i / 80); if (p[0] >= bd.x0 && p[0] <= bd.x1) arc.push(p); }
  c.beginPath(); let p = at(m, bd.x0, bd.yb0); c.moveTo(p[0], p[1]);
  p = at(m, bd.x0, arc[0][1]); c.lineTo(p[0], p[1]);
  for (const q of arc) { p = at(m, q[0], q[1]); c.lineTo(p[0], p[1]); }
  p = at(m, bd.x1, 351); c.lineTo(p[0], p[1]); p = at(m, bd.xb, bd.yb1); c.lineTo(p[0], p[1]); c.closePath();
  if (dark) { c.save(); c.shadowColor = 'rgba(220,240,255,.85)'; c.shadowBlur = 14; c.fillStyle = '#eef4f7'; c.fill(); c.restore(); }
  else { c.fillStyle = lg([257, 365], [452, 365], [[0, '#efe3cf'], [.5, '#f8eddb'], [1, '#f1e6d2']]); c.fill(); }
  if (dark) { const tp = at(m, SHIP.R[0], SHIP.R[1]); c.shadowColor = 'rgba(255,60,40,.9)'; c.shadowBlur = 10; c.fillStyle = '#ff3b2a'; c.beginPath(); c.arc(tp[0], tp[1], Math.max(2, m.s * 3), 0, TAU); c.fill(); c.shadowBlur = 0; }
  return cv;
}
KINDS.sails = {
  focus: .45,
  init(W, H, dark, R) {
    const n = Math.round(clamp(H / 44, 12, 22)), lines = [];
    for (let i = 0; i < n; i++) { const p = (i + .5) / n; lines.push({ y: H * (.04 + p * .8), p, dot: dark && R() < .3 }); }
    return { lines, c1: R() * TAU, c2: R() * TAU, c3: R() * TAU, harp: needleStrings(), rot: 0, tx: 0, ty: 0, last: null };
  },
  bg(c, W, H, dark, R, st, dpr) {
    if (!dark) {
      c.fillStyle = vgrad(c, 0, H, [[0, '#3c3938'], [.45, '#433f3c'], [1, '#3b3836']]); c.fillRect(0, 0, W, H);
      const g = c.createRadialGradient(W * .5, H * .44, 0, W * .5, H * .44, W * .9); g.addColorStop(0, 'rgba(255,240,222,.05)'); g.addColorStop(1, 'rgba(0,0,0,.1)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const band = (y0, h, base, cols) => {
        c.fillStyle = base; c.fillRect(0, y0, W, h);
        for (let i = 0; i < 9; i++) { c.fillStyle = cols[i % cols.length]; c.globalAlpha = .25 + R() * .5; c.fillRect(0, y0 + h * R(), W, Math.max(1, h * (.04 + R() * .12))); }
        c.globalAlpha = 1;
        c.fillStyle = hgrad(c, 0, W, [[0, 'rgba(0,0,0,.25)'], [.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.25)']]); c.fillRect(0, y0, W, h);
      };
      band(0, H * .026, '#1f2d3a', ['#2f4b5c', '#3b6070', '#16222c']);
      band(H * .962, H * .038, '#1d4744', ['#2e6a62', '#3c7d72', '#11302d']);
    } else {
      c.fillStyle = vgrad(c, 0, H, [[0, '#050c15'], [.45, '#0a1622'], [1, '#060d16']]); c.fillRect(0, 0, W, H);
      const g = c.createRadialGradient(W * .5, H * .44, 0, W * .5, H * .44, W * .7); g.addColorStop(0, 'rgba(110,160,195,.13)'); g.addColorStop(1, 'rgba(110,160,195,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      dust(c, W, H, R, 150);
      for (const [y, a] of [[H * .012, .5], [H * .02, .25], [H * .97, .3], [H * .978, .55], [H * .986, .3]]) {
        c.strokeStyle = hgrad(c, 0, W, [[0, 'rgba(110,200,210,0)'], [.5, `rgba(130,210,220,${a})`], [1, 'rgba(110,200,210,0)']]); c.lineWidth = 1; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
      }
    }
    st.sprite = sailSprite(W, H, dark, dpr);
  },
  fg(c, W, H, dark, t, st, still, P) {
    const a = P ? P.a : 0, step = Math.max(5, W / 110), lam = W * 1.15, lam2 = W * .52, sg = W * .085, push = W * .05 * a;
    // the field lines, pushed aside by the pointer like air around a wing
    c.lineCap = 'round';
    for (const ln of st.lines) {
      const ph = st.c1 + 2.4 * Math.sin(ln.p * 3.2 + st.c2) + t * .16, A = H * (.011 + .007 * Math.sin(ln.p * 5.3 + st.c3)), ph2 = st.c2 + ln.p * 4 - t * .11;
      c.beginPath();
      for (let x = -step, first = true; x <= W + step; x += step) {
        let y = ln.y + A * Math.sin(TAU * x / lam + ph) + H * .004 * Math.sin(TAU * x / lam2 + ph2);
        if (a > .01) { const dx = x - P.x, dy = y - P.y, d2 = dx * dx + dy * dy; if (d2 < 9 * sg * sg) y += push * Math.exp(-d2 / (2 * sg * sg)) * dy / Math.sqrt(dy * dy + W * W * 1e-4); }
        if (first) { c.moveTo(x, y); first = false; } else c.lineTo(x, y);
      }
      if (dark) { c.strokeStyle = `rgba(150,192,224,${ln.dot ? .3 : .17})`; c.lineWidth = ln.dot ? 1.3 : .9; c.setLineDash(ln.dot ? [1, 4.5] : []); }
      else { c.strokeStyle = 'rgba(22,20,20,.8)'; c.lineWidth = Math.max(1.2, W * .0032); }
      c.stroke();
    }
    c.setLineDash([]);
    // the sails tilt toward the pointer
    const m = sheet(W, H), pv = at(m, 290, 369);
    const rot = P ? a * clamp((P.x - pv[0]) / (W * .5), -1, 1) * .05 : 0, tx = P ? a * (P.x - pv[0]) * .02 : 0, ty = (P ? a * (P.y - pv[1]) * .02 : 0) + (still ? 0 : Math.sin(t * .7) * H * .003);
    st.rot += (rot - st.rot) * .12; st.tx += (tx - st.tx) * .12; st.ty += (ty - st.ty) * .12;
    c.save(); c.translate(pv[0] + st.tx, pv[1] + st.ty); c.rotate(st.rot); c.translate(-pv[0], -pv[1]);
    if (st.sprite) c.drawImage(st.sprite, 0, 0, W, H);
    // the harp strings: draw the pointer across them to pluck
    const dt = st.last == null ? 0 : clamp(t - st.last, 0, .1); st.last = t;
    let q0 = null, q1 = null;
    if (P && a > .3 && P.lx != null) {
      const inv = (x, y) => { x -= pv[0] + st.tx; y -= pv[1] + st.ty; const cs = Math.cos(-st.rot), sn = Math.sin(-st.rot); return [x * cs - y * sn + pv[0], x * sn + y * cs + pv[1]]; };
      q0 = inv(P.lx, P.ly); q1 = inv(P.rx, P.ry);
    }
    const side = (o, d, q) => d[0] * (q[1] - o[1]) - d[1] * (q[0] - o[0]);
    const sw = Math.max(.8, m.s * .85), ink = dark ? '232,244,250' : '239,228,209';
    if (dark) { c.shadowColor = 'rgba(200,230,255,.6)'; c.shadowBlur = 4; }
    for (const s of st.harp) {
      const A = at(m, s.a[0], s.a[1]), B = at(m, s.b[0], s.b[1]), Q = at(m, s.q[0], s.q[1]), d = [B[0] - A[0], B[1] - A[1]];
      if (q0 && q1 && side(A, d, q0) * side(A, d, q1) < 0) {
        const e = [q1[0] - q0[0], q1[1] - q0[1]], u = side(q0, e, A), v = side(q0, e, B);
        if (u * v < 0) s.e = Math.min(1, s.e + .8);
      }
      s.e *= Math.exp(-dt * 2.6);
      const L = Math.hypot(d[0], d[1]) || 1, off = still ? 0 : s.e * m.s * 6 * Math.sin(t * 46 + s.ph), nx = -d[1] / L, ny = d[0] / L;
      c.lineWidth = sw * s.w; c.strokeStyle = `rgba(${ink},${(s.o * (dark ? .85 : 1)).toFixed(2)})`;
      c.beginPath(); c.moveTo(A[0], A[1]); c.quadraticCurveTo(Q[0] + nx * off * 2, Q[1] + ny * off * 2, B[0], B[1]); c.stroke();
    }
    c.shadowBlur = 0;
    c.restore();
  }
};


/* ---------- PLATE IV: experiments (after "weather control") ---------- */
function field(W, H, R) {
  const bumps = []; for (let i = 0; i < 11; i++) bumps.push({ x: R() * W * 1.2 - W * .1, y: R() * H, s: W * (.09 + R() * .22), a: (R() < .5 ? -1 : 1) * (.5 + R() * .9) });
  const f = (x, y) => { let v = 0; for (const b of bumps) { const dx = x - b.x, dy = y - b.y; v += b.a * Math.exp(-(dx * dx + dy * dy) / (2 * b.s * b.s)); } return v + .15 * Math.sin(x / W * 5 + y / H * 3); };
  const cs = Math.max(5, W / 80), nx = Math.ceil(W / cs) + 1, ny = Math.ceil(H / cs) + 1, F = new Float32Array(nx * ny);
  let mn = Infinity, mx = -Infinity;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const v = f(i * cs, j * cs); F[j * nx + i] = v; if (v < mn) mn = v; if (v > mx) mx = v; }
  return { F, nx, ny, cs, mn, mx };
}
function contours(c, fd, n) {
  const { F, nx, ny, cs, mn, mx } = fd;
  c.beginPath();
  const seg = (p, q) => { c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); };
  for (let l = 1; l <= n; l++) {
    const L = mn + (mx - mn) * l / (n + 1);
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = F[j * nx + i], b = F[j * nx + i + 1], d = F[(j + 1) * nx + i], e = F[(j + 1) * nx + i + 1];
      const idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (e > L ? 2 : 0) | (d > L ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const x = i * cs, y = j * cs;
      const T = [x + cs * (L - a) / (b - a), y], Rt = [x + cs, y + cs * (L - b) / (e - b)], B = [x + cs * (L - d) / (e - d), y + cs], Lf = [x, y + cs * (L - a) / (d - a)];
      switch (idx) {
        case 1: case 14: seg(Lf, B); break;
        case 2: case 13: seg(B, Rt); break;
        case 3: case 12: seg(Lf, Rt); break;
        case 4: case 11: seg(T, Rt); break;
        case 5: seg(Lf, T); seg(B, Rt); break;
        case 6: case 9: seg(T, B); break;
        case 7: case 8: seg(Lf, T); break;
        case 10: seg(T, Rt); seg(Lf, B); break;
      }
    }
  }
  c.stroke();
}
const FL = (W, H) => ({ cx: W * .5, nT: H * .13, nB: H * .37, nw: W * .1, lipW: W * .118, lipH: H * .016, bB: H * .865, bw: W * .335, rr: W * .05 });
function flaskPath(c, W, H) {
  const f = FL(W, H);
  c.beginPath();
  c.moveTo(f.cx - f.nw, f.nT + f.lipH);
  c.lineTo(f.cx - f.lipW, f.nT + f.lipH); c.quadraticCurveTo(f.cx - f.lipW - W * .007, f.nT + f.lipH / 2, f.cx - f.lipW, f.nT);
  c.lineTo(f.cx + f.lipW, f.nT); c.quadraticCurveTo(f.cx + f.lipW + W * .007, f.nT + f.lipH / 2, f.cx + f.lipW, f.nT + f.lipH);
  c.lineTo(f.cx + f.nw, f.nT + f.lipH); c.lineTo(f.cx + f.nw, f.nB);
  c.arcTo(f.cx + f.bw, f.bB, f.cx, f.bB, f.rr);
  c.arcTo(f.cx - f.bw, f.bB, f.cx - f.nw, f.nB, f.rr);
  c.lineTo(f.cx - f.nw, f.nB);
  c.closePath();
}
function inFlask(x, y, W, H) {
  const f = FL(W, H);
  if (y < f.nB + H * .02 || y > f.bB - H * .015) return false;
  const hw = f.nw + (f.bw - f.nw) * (y - f.nB) / (f.bB - f.nB);
  return Math.abs(x - f.cx) < hw - W * .025;
}
function clouds(c, W, H, dark, R) {
  const base = H * .86, puffs = [];
  for (const [bx, h, w] of [[.3, .1, .16], [.47, .17, .12], [.69, .4, .19], [.82, .14, .15], [.18, .07, .14]]) {
    const n = Math.round(10 + h * 60);
    for (let k = 0; k < n; k++) { const q = k / n; puffs.push({ x: W * bx + (R() - .5) * W * w * (1 - q * .5), y: base - H * h * q - R() * H * .02, r: W * w * (.32 - .16 * q) * (.75 + R() * .5) }); }
  }
  for (let k = 0; k < 26; k++) puffs.push({ x: W * (.15 + .7 * R()), y: base + H * .005 - R() * H * .03, r: W * (.05 + R() * .05) });
  puffs.sort((a, b) => a.y - b.y);
  // one silhouette, shaded from below, then soft billows lit from the upper left
  c.save();
  c.beginPath(); for (const p of puffs) { c.moveTo(p.x + p.r, p.y); c.arc(p.x, p.y, p.r, 0, TAU); }
  c.fillStyle = dark ? 'rgb(92,108,128)' : '#a9adae'; c.fill();
  c.clip();
  const top = base - H * .42;
  c.fillStyle = vgrad(c, top, base + H * .02, dark ? [[0, 'rgba(20,30,44,0)'], [1, 'rgba(20,30,44,.55)']] : [[0, 'rgba(70,76,84,0)'], [1, 'rgba(70,76,84,.42)']]);
  c.fillRect(0, top, W, H);
  for (const p of puffs) {
    const g = c.createRadialGradient(p.x - p.r * .28, p.y - p.r * .38, 0, p.x - p.r * .1, p.y - p.r * .15, p.r * 1.05);
    const hi = dark ? '226,234,242' : '250,249,244';
    g.addColorStop(0, `rgba(${hi},${dark ? .72 : .9})`); g.addColorStop(.55, `rgba(${hi},${dark ? .22 : .32})`); g.addColorStop(1, `rgba(${hi},0)`);
    c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, p.r * 1.05, 0, TAU); c.fill();
  }
  c.restore();
}
function swoop(c, pts, w0, w1, col, head) {
  const [p0, p1, p2] = pts, q = (t, i) => (1 - t) * (1 - t) * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i];
  c.strokeStyle = col; c.lineCap = 'round';
  const N = 40; for (let k = 0; k < N; k++) { const a = k / N, b = (k + 1) / N; c.lineWidth = w0 + (w1 - w0) * a; c.beginPath(); c.moveTo(q(a, 0), q(a, 1)); c.lineTo(q(b, 0), q(b, 1)); c.stroke(); }
  const ex = q(1, 0), ey = q(1, 1), dx = ex - q(.97, 0), dy = ey - q(.97, 1), L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  c.fillStyle = col; c.beginPath();
  c.moveTo(ex + ux * head * .9, ey + uy * head * .9);
  c.lineTo(ex - ux * head * .5 - uy * head * .55, ey - uy * head * .5 + ux * head * .55);
  c.lineTo(ex - ux * head * .15, ey - uy * head * .15);
  c.lineTo(ex - ux * head * .5 + uy * head * .55, ey - uy * head * .5 - ux * head * .55);
  c.closePath(); c.fill();
}
function vel(x, y, W, H, P) {
  const vx = W * .36, vy = H * .56, dx = x - vx, dy = y - vy, r2 = dx * dx + dy * dy + (W * .05) ** 2, s = W * W * .012 / r2;
  let u = -dy * s, v = dx * s;
  const ux = (x - W * .68) / (W * .12); v -= Math.exp(-ux * ux) * H * .09;
  u += clamp((y - H * .7) / (H * .15), 0, 1) * W * .05;
  if (P && P.a > .01) {
    // a stirring rod: a vortex around the pointer that also draws the arrows into orbit
    const px = x - P.x, py = y - P.y, q2 = px * px + py * py, q = Math.sqrt(q2) || 1, k = P.a * W * W * .022 / (q2 + (W * .03) ** 2);
    u -= py * k; v += px * k;
    const ring = W * .07, pull = P.a * W * .5 * Math.exp(-q / (W * .2)) * clamp((q - ring) / ring, -1, 1);
    u -= px / q * pull; v -= py / q * pull;
  }
  return [u, v];
}
function spawn(W, H, R, P) {
  if (P && P.a > .3 && R() < P.a * .4) { const ang = R() * TAU, rr = W * (.03 + R() * .09), x = P.x + Math.cos(ang) * rr, y = P.y + Math.sin(ang) * rr; if (inFlask(x, y, W, H)) return { x, y, life: 0, max: 1.5 + R() * 2.5 }; }
  for (let k = 0; k < 60; k++) { const x = W * (.2 + R() * .6), y = H * (.42 + R() * .42); if (inFlask(x, y, W, H)) return { x, y, life: R() * 3, max: 2.5 + R() * 4 }; }
  return { x: W * .5, y: H * .7, life: 0, max: 3 };
}
KINDS.flask = {
  focus: .55,
  bg(c, W, H, dark, R) {
    if (!dark) {
      c.fillStyle = vgrad(c, 0, H, [[0, '#b2c69e'], [.45, '#c6d7ad'], [1, '#a9c19b']]); c.fillRect(0, 0, W, H);
      for (let i = 0; i < 7; i++) { const x = R() * W, y = R() * H, r = W * (.2 + R() * .35), col = R() < .5 ? '216,226,160' : '140,176,150'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},.45)`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(0, 0, W, H); }
    } else {
      c.fillStyle = vgrad(c, 0, H, [[0, '#050c15'], [.5, '#0a1623'], [1, '#060d16']]); c.fillRect(0, 0, W, H); dust(c, W, H, R, 120);
    }
    const fd = field(W, H, R);
    c.lineCap = 'round'; c.strokeStyle = dark ? 'rgba(80,140,190,.22)' : 'rgba(62,125,178,.55)'; c.lineWidth = dark ? .9 : Math.max(1.2, W * .0034);
    contours(c, fd, 9);
    flaskPath(c, W, H);
    c.fillStyle = dark ? vgrad(c, H * .13, H * .87, [[0, 'rgba(50,100,150,.26)'], [1, 'rgba(40,90,140,.46)']]) : vgrad(c, H * .13, H * .87, [[0, '#4c82b4'], [.5, '#4779aa'], [1, '#3f6d9c']]);
    c.fill();
    c.save(); flaskPath(c, W, H); c.clip();
    c.strokeStyle = dark ? 'rgba(120,180,225,.2)' : 'rgba(140,185,225,.5)'; c.lineWidth = dark ? .8 : Math.max(1, W * .0028); contours(c, fd, 9);
    for (let i = 1; i < 6; i++) { c.beginPath(); c.ellipse(W * .36, H * .56, W * .03 * i, W * .022 * i, -.3, 0, TAU); c.strokeStyle = dark ? `rgba(160,200,235,${.12 - i * .015})` : `rgba(185,212,236,${.32 - i * .045})`; c.lineWidth = 1; c.stroke(); }
    clouds(c, W, H, dark, R);
    c.restore();
    if (dark) { flaskPath(c, W, H); c.strokeStyle = 'rgba(150,200,235,.55)'; c.lineWidth = 1.3; c.shadowColor = 'rgba(120,190,240,.6)'; c.shadowBlur = 12; c.stroke(); c.shadowBlur = 0; }
    const ac = dark ? 'rgba(84,200,182,.92)' : '#1d5a39';
    swoop(c, [[W * .19, H * .835], [W * .5, H * .87], [W * .78, H * .72]], W * .003, W * .016, ac, W * .05);
    swoop(c, [[W * .62, H * .75], [W * .655, H * .6], [W * .71, H * .48]], W * .003, W * .013, ac, W * .042);
  },
  init(W, H, dark, R) {
    const ps = []; for (let i = 0; i < 72; i++) ps.push(spawn(W, H, R));
    const st = { ps, R, last: null };
    for (let k = 0; k < 40; k++) step(st, W, H, .05);
    return st;
  },
  fg(c, W, H, dark, t, st, still, P) {
    if (!still) { const dt = st.last == null ? 0 : clamp(t - st.last, 0, .1); st.last = t; step(st, W, H, dt, P); }
    const col = dark ? '84,200,182' : '29,90,57';
    for (const p of st.ps) {
      const [u, v] = vel(p.x, p.y, W, H, P), m = Math.hypot(u, v) || 1, ux = u / m, uy = v / m, L = W * .024 * clamp(.75 + m / (W * .6), .75, 1.7);
      const a = still ? .85 : Math.sin(Math.PI * clamp(p.life / p.max, 0, 1));
      c.strokeStyle = c.fillStyle = `rgba(${col},${(a * .95).toFixed(3)})`;
      c.lineWidth = Math.max(1, W * .0024);
      const tx = p.x + ux * L * .5, ty = p.y + uy * L * .5;
      c.beginPath(); c.moveTo(p.x - ux * L * .5, p.y - uy * L * .5); c.lineTo(tx, ty); c.stroke();
      const hs = L * .42;
      c.beginPath(); c.moveTo(tx + ux * hs * .5, ty + uy * hs * .5); c.lineTo(tx - ux * hs * .6 - uy * hs * .5, ty - uy * hs * .6 + ux * hs * .5); c.lineTo(tx - ux * hs * .6 + uy * hs * .5, ty - uy * hs * .6 - ux * hs * .5); c.closePath(); c.fill();
    }
  }
};
function step(st, W, H, dt, P) {
  for (let i = 0; i < st.ps.length; i++) {
    const p = st.ps[i], [u, v] = vel(p.x, p.y, W, H, P);
    p.x += u * dt; p.y += v * dt; p.life += dt;
    if (p.life > p.max || !inFlask(p.x, p.y, W, H)) { st.ps[i] = spawn(W, H, st.R, P); st.ps[i].life = 0; }
  }
}

/* ---------- PLATE V: open channels (after "worlds without end") ---------- */
function galaxy(c, x, y, s, rot, rgb, R) {
  c.save(); c.translate(x, y); c.rotate(rot);
  for (let k = 0; k < 5; k++) {
    const rx = s * (.25 + k * .2), ry = rx * .42, a0 = R() * TAU;
    c.strokeStyle = `rgba(${rgb},${.55 - k * .09})`; c.lineWidth = Math.max(1, s * (.05 - k * .006)); c.setLineDash([s * .12 * (1 + R()), s * .05]);
    c.beginPath(); c.ellipse(s * .05 * k, 0, rx, ry, k * .18, a0, a0 + TAU * .8); c.stroke();
  }
  c.setLineDash([]);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, s * .25); g.addColorStop(0, `rgba(${rgb},.9)`); g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, s * .25, 0, TAU); c.fill(); c.restore();
}
KINDS.eclipse = {
  focus: .38,
  init(W, H, dark, R) { return { ex: W * .42, ey: H * .31, Rr: W * .2, R, motes: [], bul: 0, th: -Math.PI / 2, sig: .7, last: null }; },
  bg(c, W, H, dark, R, st) {
    const { ex, ey, Rr } = st;
    c.fillStyle = dark ? vgrad(c, 0, H, [[0, '#03070d'], [1, '#060b13']]) : vgrad(c, 0, H, [[0, '#3a3c3b'], [.5, '#333534'], [1, '#2d2f2e']]);
    c.fillRect(0, 0, W, H);
    for (let i = 0; i < 520; i++) {
      const r = W * (.18 + R() * 1.25), a0 = R() * TAU, len = .25 + R(), light = R() < .55;
      c.strokeStyle = dark ? (light ? `rgba(150,175,205,${.015 + R() * .03})` : 'rgba(0,0,0,.1)') : (light ? `rgba(255,255,255,${.018 + R() * .035})` : `rgba(0,0,0,${.05 + R() * .06})`);
      c.lineWidth = .5 + R() * 1.4; c.beginPath(); c.ellipse(ex + W * .05, ey + H * .12, r, r * .82, .5, a0, a0 + len); c.stroke();
    }
    if (dark) dust(c, W, H, R, 180);
    let g = c.createRadialGradient(ex, ey, Rr, ex, ey, Rr * 2.7);
    g.addColorStop(0, dark ? 'rgba(150,170,200,.2)' : 'rgba(122,80,72,.55)'); g.addColorStop(1, dark ? 'rgba(150,170,200,0)' : 'rgba(122,80,72,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const phi = -2.28;
    for (let i = 0; i < 2600; i++) {
      const a = R() * TAU, d = a - phi, cusp = Math.pow(Math.abs(Math.cos(d)), 9), side = Math.pow(Math.abs(Math.sin(d)), 14);
      const L = Rr * (.12 + 2.35 * cusp * (.75 + R() * .35) + .45 * side + R() * .12), bend = .55 * Math.sin(2 * d), r0 = Rr * .97;
      const am = a + bend * .14 * (L / Rr), ae = a + bend * .22 * (L / Rr);
      c.strokeStyle = dark ? `rgba(246,240,228,${.05 + R() * .05})` : `rgba(244,236,218,${.05 + R() * .06})`;
      c.lineWidth = .6 + R() * .9;
      c.beginPath(); c.moveTo(ex + Math.cos(a) * r0, ey + Math.sin(a) * r0);
      c.quadraticCurveTo(ex + Math.cos(am) * (r0 + L * .55), ey + Math.sin(am) * (r0 + L * .55), ex + Math.cos(ae) * (r0 + L), ey + Math.sin(ae) * (r0 + L));
      c.stroke();
    }
    g = c.createRadialGradient(ex, ey, Rr * .98, ex, ey, Rr * 1.45);
    g.addColorStop(0, dark ? 'rgba(255,248,235,.95)' : 'rgba(246,239,222,.95)'); g.addColorStop(.35, 'rgba(240,230,210,.45)'); g.addColorStop(1, 'rgba(240,230,210,0)');
    c.fillStyle = g; c.beginPath(); c.arc(ex, ey, Rr * 1.45, 0, TAU); c.fill();
    c.fillStyle = dark ? '#010306' : '#0a0a0a'; c.beginPath(); c.arc(ex, ey, Rr, 0, TAU); c.fill();
    galaxy(c, W * .24, H * .79, W * .13, -.9, dark ? '200,225,235' : '96,168,124', R);
    galaxy(c, W * .97, H * .14, W * .11, .6, dark ? '190,215,235' : '70,130,150', R);
    galaxy(c, W * .86, H * .97, W * .12, .2, dark ? '190,215,235' : '70,130,150', R);
    const lx0 = W * .865, ly0 = H * .255, lx1 = W * .665, ly1 = H * 1.02;
    g = c.createLinearGradient(lx0, ly0, lx1, ly1);
    g.addColorStop(0, '#ffffff'); g.addColorStop(.04, '#f0d6cc'); g.addColorStop(.12, dark ? '#e8513c' : '#c9463c'); g.addColorStop(1, dark ? 'rgba(232,81,60,.5)' : 'rgba(201,70,60,.85)');
    c.strokeStyle = g; c.lineWidth = Math.max(1.2, W * .0028);
    if (dark) { c.shadowColor = 'rgba(240,80,60,.7)'; c.shadowBlur = 8; }
    c.beginPath(); c.moveTo(lx0, ly0); c.lineTo(lx1, ly1); c.stroke(); c.shadowBlur = 0;
    if (dark) { c.shadowColor = 'rgba(255,60,40,.9)'; c.shadowBlur = W * .03; }
    c.fillStyle = dark ? '#ff3b2a' : '#e3231b'; c.beginPath(); c.arc(W * .69, H * .585, W * .018, 0, TAU); c.fill(); c.shadowBlur = 0;
  },
  fg(c, W, H, dark, t, st, still, P) {
    const { ex, ey, Rr } = st, a = P ? P.a : 0;
    const dt = st.last == null ? 0 : clamp(t - st.last, 0, .1); st.last = t;
    // the disc stretches toward the pointer, as if it wants to swallow it
    let bul = 0, sig = .75, prox = 0;
    if (a > .001) {
      const dx = P.x - ex, dy = P.y - ey, d = Math.hypot(dx, dy);
      prox = a * clamp(1 - (d - Rr) / (Rr * 2.3), 0, 1);
      bul = Math.min(.24, prox * prox * .26 + prox * .04); sig = .78 - .38 * prox;
      let dth = Math.atan2(dy, dx) - st.th; dth = Math.atan2(Math.sin(dth), Math.cos(dth)); st.th += dth * .2;
    }
    st.bul += (bul - st.bul) * .12; st.sig += (sig - st.sig) * .12;
    const N = 140, rOf = q => { let dq = q - st.th; dq = Math.atan2(Math.sin(dq), Math.cos(dq)); return Rr * (1 + st.bul * Math.exp(-dq * dq / (2 * st.sig * st.sig)) + (still ? 0 : .005 * Math.sin(q * 5 + t * .8))); };
    c.beginPath();
    for (let i = 0; i <= N; i++) { const q = i / N * TAU, r = rOf(q), x = ex + Math.cos(q) * r, y = ey + Math.sin(q) * r; if (i) c.lineTo(x, y); else c.moveTo(x, y); }
    c.closePath();
    c.save(); c.shadowColor = dark ? 'rgba(255,248,235,.95)' : 'rgba(250,242,224,.9)'; c.shadowBlur = Rr * .16;
    c.strokeStyle = dark ? 'rgba(255,248,236,.9)' : 'rgba(248,240,222,.85)'; c.lineWidth = Rr * .022; c.stroke(); c.restore();
    c.fillStyle = dark ? '#010306' : '#0a0a0a'; c.fill();
    // light from the pointer spirals in
    if (!still && prox > .04 && st.motes.length < 220) {
      const n = Math.random() < prox * 2.5 ? 2 + (Math.random() < prox ? 2 : 0) : 0;
      for (let k = 0; k < n; k++) {
        const ox = P.x + (Math.random() - .5) * W * .05, oy = P.y + (Math.random() - .5) * W * .05;
        st.motes.push({ r: Math.hypot(ox - ex, oy - ey), q: Math.atan2(oy - ey, ox - ex), u: 0, sp: .38 + Math.random() * .4, spin: (Math.random() < .5 ? -1 : 1) * (1 + Math.random() * .9), tr: [] });
      }
    }
    if (st.motes.length) {
      const rgb = dark ? '214,232,250' : '246,238,220';
      c.lineCap = 'round'; c.lineWidth = Math.max(1.2, W * .0028);
      if (dark) { c.shadowColor = 'rgba(200,225,255,.8)'; c.shadowBlur = 6; }
      st.motes = st.motes.filter(m => {
        m.u += dt * m.sp;
        const r0 = m.r * Math.pow(1 - Math.min(m.u, 1), 1.25), q = m.q + m.spin * m.u * m.u, x = ex + Math.cos(q) * r0, y = ey + Math.sin(q) * r0;
        const inside = r0 < rOf(q) * .98;
        m.tr.push(x, y); if (m.tr.length > 20) m.tr.splice(0, 2);
        if (!inside && m.tr.length > 2) {
          c.strokeStyle = `rgba(${rgb},${(.95 * Math.min(1, m.u * 6)).toFixed(3)})`;
          c.beginPath(); c.moveTo(m.tr[0], m.tr[1]); for (let j = 2; j < m.tr.length; j += 2) c.lineTo(m.tr[j], m.tr[j + 1]); c.stroke();
        }
        return !inside && m.u < 1.2;
      });
      c.shadowBlur = 0;
    }
  }
};

/* ---------- plate engine ---------- */
const ORDER = ['forces', 'fusion', 'sails', 'flask', 'eclipse'];
class Plate {
  constructor(host, k) {
    this.host = host; this.k = k; this.kind = KINDS[ORDER[k]];
    this.canvas = host.querySelector('canvas'); this.ctx = this.canvas.getContext('2d');
    this.layer = document.createElement('canvas'); this.lctx = this.layer.getContext('2d');
    this.t0 = performance.now(); this.built = false;
  }
  build() {
    const r = this.host.getBoundingClientRect(), W = Math.round(r.width), H = Math.round(r.height);
    if (!W || !H) { this.built = false; return false; }
    const dpr = Math.min(2, window.devicePixelRatio || 1), Hp = Math.max(H, W / .8), off = clamp(this.kind.focus * Hp - H / 2, 0, Hp - H);
    Object.assign(this, { W, H, Hp, off, dpr, dark: isDark() });
    for (const cv of [this.canvas, this.layer]) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const l = this.lctx; l.setTransform(1, 0, 0, 1, 0, 0); l.clearRect(0, 0, this.layer.width, this.layer.height);
    this.state = this.kind.init ? this.kind.init(W, Hp, this.dark, rng(2000 + this.k * 31)) : {};
    l.setTransform(dpr, 0, 0, dpr, 0, -off * dpr);
    this.kind.bg(l, W, Hp, this.dark, rng(1000 + this.k * 77), this.state, dpr);
    this.built = true; return true;
  }
  draw(now, still, P) {
    if (!this.built) return;
    const c = this.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.canvas.width, this.canvas.height); c.drawImage(this.layer, 0, 0);
    if (!this.kind.fg) return;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, -this.off * this.dpr);
    const Q = P && !still ? { a: P.a, x: P.sx, y: P.sy + this.off, rx: P.x, ry: P.y + this.off, lx: P.lx, ly: P.ly == null ? null : P.ly + this.off } : null;
    this.kind.fg(c, this.W, this.Hp, this.dark, (now - this.t0) / 1000, this.state, still, Q);
  }
}

const stageEl = document.getElementById('stage');
const plates = [...document.querySelectorAll('.stage .plate')].map(el => new Plate(el, +el.dataset.k));
const strips = [...document.querySelectorAll('.strip')].map(el => new Plate(el, +el.dataset.k));
let active = 0, stageVisible = true, instantTurn = false;
const shown = el => el.offsetParent !== null || getComputedStyle(el).position === 'fixed';

function buildAll() {
  const now = performance.now(), still = !motionOK();
  plates.forEach((p, i) => { if (shown(p.host) && p.build()) p.draw(now, still || i !== active); });
  strips.forEach(s => { if (shown(s.host) && s.build()) s.draw(now, true); });
}
let pending = 0;
const rebuild = () => { cancelAnimationFrame(pending); pending = requestAnimationFrame(() => { buildAll(); fitWordmarks(); }); };

function fitWordmarks() {
  document.querySelectorAll('.pl-wm').forEach(el => {
    const W = el.parentElement.clientWidth; if (!W) return;
    el.style.fontSize = ''; const w = el.scrollWidth; if (!w) return;
    el.style.fontSize = (9.5 * (W * .888) / w).toFixed(3) + 'cqw';
  });
}

/* the pointer: each plate answers it in its own way */
const ptr = { x: 0, y: 0, sx: 0, sy: 0, a: 0, on: false, lx: null, ly: null };
const setPtr = e => {
  const r = stageEl.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
  if (ptr.a < .02) { ptr.sx = ptr.x; ptr.sy = ptr.y; ptr.lx = null; }
  ptr.on = true;
};
const offPtr = () => { ptr.on = false; ptr.lx = null; };
stageEl.addEventListener('pointermove', setPtr);
stageEl.addEventListener('pointerdown', setPtr);
stageEl.addEventListener('pointerleave', offPtr);
stageEl.addEventListener('pointercancel', offPtr);
stageEl.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') offPtr(); });

let last = 0, prevNow = 0;
function tick(now) {
  requestAnimationFrame(tick);
  const dt = clamp((now - prevNow) / 1000, 0, .1); prevNow = now;
  ptr.a += ((ptr.on ? 1 : 0) - ptr.a) * (1 - Math.exp(-dt * (ptr.on ? 5 : 2.2)));
  const f = 1 - Math.exp(-dt * 14); ptr.sx += (ptr.x - ptr.sx) * f; ptr.sy += (ptr.y - ptr.sy) * f;
  const live = ptr.a > .01;
  if (!motionOK() || document.hidden || !stageVisible || now - last < (live ? 15 : 33)) return;
  last = now;
  const p = deskMQ.matches ? plates[active] : plates[0];
  if (p && p.built && p.kind.fg) p.draw(now, false, live ? ptr : null);
  if (ptr.on) { ptr.lx = ptr.x; ptr.ly = ptr.y; }
}

/* plate turns: the next plate wipes in like a page */
let z = 1;
function showPlate(k) {
  if (k === active) return;
  const dir = k > active ? 1 : -1, next = plates[k]; active = k;
  if (!deskMQ.matches) return;
  if (!next.built) next.build();
  next.t0 = performance.now(); next.draw(next.t0, !motionOK());
  const el = next.host; el.style.zIndex = ++z;
  const finish = () => plates.forEach(p => { if (p !== next) { p.host.classList.remove('is-on'); p.host.style.transition = 'none'; p.host.style.clipPath = ''; } });
  if (!motionOK() || instantTurn) { el.style.transition = 'none'; el.style.clipPath = 'inset(0 0 0 0)'; el.classList.add('is-on'); finish(); return; }
  el.style.transition = 'none'; el.style.clipPath = dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'; el.getBoundingClientRect();
  el.style.transition = 'clip-path 1s cubic-bezier(.65,0,.25,1)'; el.style.clipPath = 'inset(0 0 0 0)'; el.classList.add('is-on');
  let settled = false;
  const done = e => { if (settled || (e && e.propertyName !== 'clip-path')) return; settled = true; el.removeEventListener('transitionend', done); if (active === k) finish(); };
  el.addEventListener('transitionend', done);
  setTimeout(done, 1200);
}
function setCaption(k, text) {
  const cap = plates[k] && plates[k].host.querySelector('.pl-cap');
  if (!cap || cap.textContent === text) return;
  if (!motionOK() || instantTurn) { cap.textContent = text; cap.classList.remove('swap'); return; }
  cap.classList.add('swap'); setTimeout(() => { cap.textContent = text; cap.classList.remove('swap'); }, 350);
}

/* running head + plate follow the section at reading height */
const rh = document.getElementById('rh-now');
const secs = [...document.querySelectorAll('.sec[data-plate]')];
function setSection(sec) {
  const k = +sec.dataset.plate;
  rh.innerHTML = `<b>p. ${sec.dataset.folio}</b>&emsp;${sec.dataset.name}`;
  setCaption(k, sec.dataset.cap);
  showPlate(k);
  syncTurner();
}
let curSec = null, sq = 0;
function track() {
  sq = 0;
  const line = innerHeight * .4;
  let hit = secs[0];
  for (const s of secs) { if (s.getBoundingClientRect().top <= line) hit = s; else break; }
  if (hit !== curSec) { curSec = hit; setSection(hit); }
  pgPrev.disabled = secs.indexOf(curSec) === 0 && scrollY < 8;
}
const queueTrack = () => { if (!sq) sq = requestAnimationFrame(track); };
addEventListener('scroll', queueTrack, { passive: true });
addEventListener('resize', queueTrack);
new IntersectionObserver(es => { stageVisible = es[0].isIntersecting; }).observe(stageEl);

/* turning pages: the corner, the running head, the arrow keys, a sideways swipe, the contents */
const corner = document.getElementById('corner'), cLab = corner.querySelector('.corner-lab'), cFol = corner.querySelector('.corner-folio');
const pgPrev = document.getElementById('pg-prev'), pgNext = document.getElementById('pg-next');
function syncTurner() {
  const i = secs.indexOf(curSec), nx = secs[i + 1];
  if (nx) { cLab.textContent = `p. ${nx.dataset.folio}\u2003${nx.dataset.name}`; cFol.textContent = nx.dataset.folio; corner.setAttribute('aria-label', `Turn to page ${+nx.dataset.folio}: ${nx.dataset.name}`); }
  else { cLab.textContent = 'back to the cover'; cFol.textContent = '01'; corner.setAttribute('aria-label', 'Back to the cover'); }
  pgNext.disabled = !nx;
}
let turning = false;
function go(sec, dir) {
  if (!sec || turning) return;
  const jump = () => {
    if (sec === secs[0]) scrollTo({ top: 0, behavior: 'instant' }); else sec.scrollIntoView({ block: 'start', behavior: 'instant' });
    instantTurn = true; curSec = null; track(); instantTurn = false;
  };
  corner.classList.remove('is-hint');
  if (!motionOK()) { jump(); return; }
  if (!document.startViewTransition) { if (sec === secs[0]) scrollTo({ top: 0, behavior: 'smooth' }); else sec.scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
  turning = true; root.dataset.turn = dir > 0 ? 'fwd' : 'back';
  const end = () => { turning = false; delete root.dataset.turn; };
  try { document.startViewTransition(jump).finished.then(end, end); } catch (e) { end(); jump(); }
}
function turn(dir) {
  const i = Math.max(0, secs.indexOf(curSec));
  if (dir > 0) { if (secs[i + 1]) go(secs[i + 1], 1); else go(secs[0], -1); return; }
  if (secs[i].getBoundingClientRect().top < -80) go(secs[i], -1); else if (i > 0) go(secs[i - 1], -1); else if (scrollY > 8) go(secs[0], -1);
}
corner.addEventListener('click', () => turn(1));
pgNext.addEventListener('click', () => turn(1));
pgPrev.addEventListener('click', () => turn(-1));
addEventListener('keydown', e => {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  const t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
});
let swipe0 = null;
addEventListener('touchstart', e => { const p = e.touches[0]; swipe0 = e.touches.length === 1 ? { x: p.clientX, y: p.clientY, t: performance.now() } : null; }, { passive: true });
addEventListener('touchend', e => {
  if (!swipe0) return;
  const p = e.changedTouches[0], dx = p.clientX - swipe0.x, dy = p.clientY - swipe0.y, dt = performance.now() - swipe0.t; swipe0 = null;
  if (dt < 700 && Math.abs(dx) > 64 && Math.abs(dx) > 2.2 * Math.abs(dy)) turn(dx < 0 ? 1 : -1);
}, { passive: true });
document.querySelectorAll('.toc a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const s = document.getElementById(a.getAttribute('href').slice(1)); if (!s) return;
  e.preventDefault(); go(s, secs.indexOf(s) >= secs.indexOf(curSec) ? 1 : -1);
}));
setTimeout(() => { if (!turning && scrollY < 40 && motionOK()) { corner.classList.add('is-hint'); corner.addEventListener('animationend', () => corner.classList.remove('is-hint'), { once: true }); } }, 2600);

/* theme: day / night editions */
const sw = document.getElementById('theme');
try { const s = localStorage.getItem('mg-edition'); if (s && !root.hasAttribute('data-theme')) root.setAttribute('data-theme', s); } catch (e) {}
const syncSwitch = () => { const d = isDark(); sw.classList.toggle('is-dark', d); sw.setAttribute('aria-pressed', String(d)); };
sw.setAttribute('aria-label', 'Night edition');
sw.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark'; root.setAttribute('data-theme', next);
  try { localStorage.setItem('mg-edition', next); } catch (e) {}
});
new MutationObserver(() => { syncSwitch(); rebuild(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
darkMQ.addEventListener('change', () => { syncSwitch(); rebuild(); });
deskMQ.addEventListener('change', () => { plates.forEach((p, i) => { p.host.classList.toggle('is-on', i === active); p.host.style.clipPath = ''; p.host.style.transition = 'none'; }); rebuild(); });
motionMQ.addEventListener('change', rebuild);
let rt = 0; const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(rebuild, 60); });
ro.observe(stageEl); strips.forEach(s => ro.observe(s.host));
syncSwitch();

/* operations: expand all */
const jobs = [...document.querySelectorAll('.job')];
const ex = document.getElementById('expand-all');
const syncEx = () => { ex.textContent = jobs.every(j => j.open) ? 'Collapse all' : 'Expand all'; };
ex.addEventListener('click', () => { const open = !jobs.every(j => j.open); jobs.forEach(j => j.open = open); syncEx(); });
jobs.forEach(j => j.addEventListener('toggle', syncEx));

/* research: live GitHub figures for the featured plugin (the printed figures stay if the API does not answer) */
const ghEls = document.querySelectorAll('[data-gh]');
if (ghEls.length && 'fetch' in window) {
  const kfmt = n => n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}<i>K</i>` : String(n);
  fetch('https://api.github.com/repos/gvzdv/claudish-to-english', { headers: { Accept: 'application/vnd.github+json' } })
    .then(r => r.ok ? r.json() : null)
    .then(d => { if (!d) return; ghEls.forEach(el => { const v = el.dataset.gh === 'forks' ? d.forks_count : d.stargazers_count; if (Number.isFinite(v) && v > 0) el.innerHTML = kfmt(v); }); })
    .catch(() => {});
}

/* correspondence: copy address */
const mail = document.getElementById('mail'), cs = document.getElementById('copy-status');
document.getElementById('copy-mail').addEventListener('click', () => {
  const sel = () => { const r = document.createRange(); r.selectNodeContents(mail); const s = getSelection(); s.removeAllRanges(); s.addRange(r); cs.textContent = 'Selected, press ⌘C'; };
  try { navigator.clipboard.writeText(mail.textContent.trim()).then(() => { cs.textContent = 'Copied'; setTimeout(() => cs.textContent = '', 2400); }, sel); } catch (e) { sel(); }
});

/* boot */
buildAll(); fitWordmarks(); track();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fitWordmarks(); });
requestAnimationFrame(tick);
})();
