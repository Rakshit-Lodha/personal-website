// Roman v2 runtime artwork (Track B, B1–B6).
//
// Regenerated masters in design/roman-v2/assets/masters/<id>.png are preferred and receive only
// the configured edge fades. Assets without a master still fall back to approved concept crops;
// those fallback entries are explicitly marked interim in the generated manifest.
//
// Run: node scripts/prepare-roman-v2-assets.mjs        (writes public/roman-v2/** + manifest)
//      node scripts/prepare-roman-v2-assets.mjs --preview <dir>   (also writes flattened PNG previews)
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const conceptDir = path.join(root, 'design/roman-v2/concepts');
const masterDir = path.join(root, 'design/roman-v2/assets/masters');
const outRoot = path.join(root, 'public/roman-v2');
const previewDir = process.argv.includes('--preview') ? process.argv[process.argv.indexOf('--preview') + 1] : null;

const C = {
  hero: '01-hero-approved.png',
  career: '02-work-over-time-approved.png',
  projects: '03-selected-products-approved.png',
  beyond: '04-beyond-work-approved.png',
  jj: '05-jj-approved.png',
  footer: '06-footer-approved.png',
};

// Colours sampled (median of small patches) from the concept PNGs.
const PALETTE = {
  hero: { paper: '#f4ebdf', paperLight: '#f7f1e9', circle: '#ecdecf', terracottaBand: '#b5644b', oxblood: '#671816' },
  career: { sage: '#dcd8cc', sageCircle: '#c2c1b1', card: '#f6efe5', cardWarmEdge: '#d9baa8', oxblood: '#681816' },
  projects: { paper: '#efe7dc', terracotta: '#b26e58', terracottaDeep: '#a2604b', featureCard: '#d6a48e', oxblood: '#66211e', frameInterior: '#141413' },
  beyond: { sage: '#c0bfae', paper: '#ede5da', card: '#f2eae0', oxblood: '#6b2624', musicCircle: '#662823', playerDark: '#222322' },
  jj: { oxblood: '#4f1816', oxbloodCircle: '#491614', oxbloodDeep: '#3a1110', ivoryButton: '#f4ebe0', footerPaper: '#ece2d5' },
  footer: { paper: '#f0e8dd', circle: '#e5d9cc', rule: '#7d211d', darkBand: '#1c1b1b' },
};

const STATUS = 'interim – derived from approved concept; replace with regenerated art';

// Shapes are in CONCEPT pixel coordinates. rect = [x, y, w, h]; poly = [[x,y],...]; circle = [cx, cy, r]; line = [[x,y],...] polyline.
const ASSETS = [
  {
    id: 'hero-figure', section: 'hero', concept: C.hero, crop: [560, 95, 1105, 748], widths: [720, 1105, 1536], matte: { lo: 3, hi: 7 }, 
    bg: PALETTE.hero.paper, fade: { left: 110, top: 70, right: 30 },
    ops: [{ op: 'erase', rect: [540, 300, 165, 192], feather: 18, why: 'tail of headline “judgment.”' }],
    placement: 'Desktop hero: right ~60% of the hero, bottom-aligned to the hero bottom edge (the terracotta band sits directly below). Copy sits to the left.',
    notes: 'Contains part of the large faint circle (#ecdecf). Full circle in concept px ≈ centre (1247, 450), r ≈ 507 – draw it in CSS behind the figure. Nav pill, headline, copy, buttons and terracotta band excluded.',
    masterNotes: 'Approved generated desktop hero. Figure, hands and laptop all face left; left copy field is intentionally clear. Draw the large faint circle and all interface elements in CSS/HTML.',
  },
  {
    id: 'hero-hands-mobile', section: 'hero', concept: C.hero, crop: [770, 95, 850, 748], widths: [480, 780], matte: { lo: 3, hi: 7 }, 
    // Laptop and typing hands only (no head), cut from the mobile master; the right and bottom edges
    // run off the viewport, so only the cut top fades.
    master: 'hero-figure-mobile', masterCrop: [0, 640, 780, 614], masterFade: { top: 60 },
    bg: PALETTE.hero.paper, fade: { left: 90, top: 60, right: 30 },
    ops: [],
    placement: 'Mobile hero: full-bleed laptop + hands crop anchored to the bottom of the first fold, below the headline/CTA stack.',
    notes: 'Laptop lid is partially cropped and fades out on the left.',
    masterNotes: 'Crop of the approved mobile hero master: halftone, laptop and hands typing; head and armrest excluded. All interface elements remain CSS/HTML.',
  },
  {
    id: 'career-hands', section: 'career', concept: C.career, crop: [860, 333, 812, 357], widths: [560, 812, 1072], matte: { lo: 3, hi: 7 },
    // The master puts the hands in its right ~60%: drop the empty left field (x < 600), the sparse top
    // rows and the empty rows under the plinth, so the hands fill the right of the concept's 860–1672
    // box (left fingertips ≈14% in) with the halftone dissolving to their left. The drape's cut top
    // and right edges fade out (the right edge shows above the card once it stops at the container).
    masterCrop: [600, 90, 1072, 790], masterFade: { left: 140, top: 90, right: 48 },

    bg: PALETTE.career.card, fade: { left: 120, bottom: 24 },
    ops: [
      { op: 'inpaint', circle: [1237, 399, 9], why: 'chart node' },
      { op: 'inpaint', line: [[1237, 399], [1250, 391], [1266, 380], [1286, 366], [1300, 350], [1312, 335], [1315, 330]], width: 6, why: 'chart curve' },
      { op: 'inpaint', line: [[1150, 413], [1237, 399], [1296, 417]], width: 5, why: 'chart segment' },
      { op: 'inpaint', circle: [1296, 417, 5], why: 'chart node' },
      { op: 'inpaint', circle: [1456, 529, 9], why: 'chart node' },
      { op: 'inpaint', line: [[1380, 529], [1535, 529]], width: 5, why: 'chart axis' },
      { op: 'inpaint', line: [[1456, 470], [1456, 529]], width: 5, why: 'chart drop line' },
    ],
    placement: 'Active chapter card: top-right of the card, top edge aligned to the card top, right-aligned to the card edge; chapter copy to the left, metrics row below.',
    notes: 'Chart nodes/curve/axis inpainted; faint blueprint grid inside the halftone remains (reads as texture). Hands’ upper sleeve (on the sage band above the card) is cut by the top edge.',
    masterNotes: 'Approved generated career artwork: hands assemble geometric blocks; no charts, grids, text or UI are baked into the image.',
  },
  {
    id: 'projects-frame', section: 'projects', concept: C.projects, crop: [690, 78, 960, 590], widths: [640, 960, 1536], matte: { lo: 3, hi: 7 },
    bg: PALETTE.projects.terracotta, fade: { left: 70, top: 16, bottom: 16, right: 16 },
    ops: [
      { op: 'paint', color: '#b26e58', poly: [[690, 78], [860, 78], [800, 160], [740, 260], [700, 360], [690, 360]], feather: 30, why: 'paper outside the terracotta circle' },
      { op: 'key', color: '#b26e58', lo: 0.24, hi: 0.46, why: 'terracotta background → alpha' },
      { op: 'erase', poly: [[984, 250], [1050, 238], [1495, 158], [1498, 452], [1468, 470], [1436, 516], [1392, 540], [1015, 562], [984, 552]], feather: 2, why: 'fake product UI inside the frame → transparent window' },
    ],
    placement: 'Featured product: right ~60% of the featured block over the CSS terracotta circle; real product screenshot goes BEHIND this layer inside the transparent window.',
    notes: 'Frame interior is a transparent window – see `window` (output px at full width). Terracotta background keyed to alpha so it can sit on a CSS terracotta circle. Darker marble shadows are partly translucent after keying, so this layer MUST sit over terracotta #b26e58 (not paper).',
    masterNotes: 'Approved generated frame. The inner #141413 opening is a placement area; render real product UI above the raster within that opening.',
  },
  {
    id: 'projects-head', section: 'projects', concept: C.projects, crop: [690, 120, 300, 548], widths: [300],
    bg: PALETTE.projects.terracotta, fade: { left: 40, right: 50, top: 16, bottom: 16 },
    ops: [
      { op: 'paint', color: '#b26e58', poly: [[690, 78], [860, 78], [800, 160], [740, 260], [700, 360], [690, 360]], feather: 30, why: 'paper outside the terracotta circle' },
      { op: 'key', color: '#b26e58', lo: 0.24, hi: 0.46, why: 'terracotta background → alpha' },
      { op: 'erase', poly: [[984, 230], [1000, 230], [1000, 570], [984, 570]], feather: 2, why: 'edge of fake UI' },
    ],
    placement: 'Fallback / mobile: the sculpture head fragment alone (if the frame layer is not used). Left of the product screenshot.',
    notes: 'Right edge crosses the dark gap between head and frame and fades out. Keyed like projects-frame – place over terracotta #b26e58.',
    masterNotes: 'Approved generated right-facing marble head on terracotta; no frame or product UI is baked in.',
  },
  {
    id: 'beyond-reading', section: 'beyond', concept: C.beyond, crop: [548, 272, 584, 419], widths: [584, 1168], matte: { lo: 3, hi: 7 }, 
    bg: PALETTE.beyond.card, fade: { left: 80, top: 10 },
    // Master: dissolve the left-hand halftone tiles over the left 30% (was a CSS mask).
    masterFade: { left: 460, top: 10 },
    ops: [],
    placement: 'Daily Reading card: right half of the card, bottom- and right-aligned; heading/CTA on the left.',
    notes: 'Paper sheets carry abstract grey “ruled lines” (not readable text) as in the concept.',
    masterNotes: 'Approved generated reading collage with no readable text and a clear left copy field.',
  },
  {
    id: 'beyond-music', section: 'beyond', concept: C.beyond, crop: [290, 706, 516, 210], widths: [536],
    bg: PALETTE.beyond.card, fade: { left: 40 },
    // Master: the halftone hand-on-knob strip cropped from the approved music close-up; cream sits on the card, the right edge on the player panel.
    masterFade: { left: 16, right: 6 },
    ops: [
      { op: 'inpaint', line: [[712, 860], [806, 860]], width: 6, why: 'player progress bar' },
    ],
    placement: 'Music card: full card height, right of the copy; the HTML player panel (#222322) continues from its right edge and holds waveform/progress/controls.',
    notes: 'Right portion is the dark player panel corner; waveform, progress bar and transport controls excluded/inpainted.',
    masterNotes: 'Cropped from the approved music close-up (oxblood circle, halftone-dissolving marble hand, knob); progress line removed. Waveform, labels and player controls are HTML/CSS.',
  },
  {
    id: 'beyond-column', section: 'beyond', concept: C.beyond, crop: [860, 0, 812, 266], widths: [560, 812, 1672], matte: { lo: 3, hi: 7 }, 
    bg: PALETTE.beyond.sage, fade: { left: 110, bottom: 36 },
    // Master: dissolve the halftone and leaf tips over the left 34% into the paper circle (was a CSS mask).
    masterFade: { left: 570, bottom: 36 },
    ops: [],
    placement: 'Section header decoration: top-right of Beyond Work, top- and right-aligned, behind the section title row.',
    notes: 'Includes part of the light sage circle behind the foliage.',
    masterNotes: 'Approved generated column and olive branch with a clear left field for section copy.',
  },
  {
    id: 'beyond-whoop-fragment', section: 'beyond', concept: C.beyond, crop: [1492, 708, 144, 206], widths: [144],
    bg: PALETTE.beyond.card, fade: { left: 36, top: 10 },
    ops: [],
    placement: 'WHOOP card: right edge decoration, bottom-right aligned.',
    notes: 'Small sculpture fragment + halftone.',
  },
  { id: 'writing-thumb-head', section: 'beyond', concept: C.beyond, crop: [1183, 375, 100, 68], widths: [100], bg: null, fade: {}, ops: [], opaque: true, placement: 'Writing row thumbnail (≈100×68).', notes: '' },
  { id: 'writing-thumb-column', section: 'beyond', concept: C.beyond, crop: [1183, 462, 100, 68], widths: [100], bg: null, fade: {}, ops: [], opaque: true, placement: 'Writing row thumbnail (≈100×68).', notes: '' },
  { id: 'writing-thumb-mountain', section: 'beyond', concept: C.beyond, crop: [1183, 548, 100, 61], widths: [100], bg: null, fade: {}, ops: [], opaque: true, placement: 'Writing row thumbnail (≈100×61).', notes: '' },
  {
    id: 'jj-listener', section: 'jj', concept: C.jj, crop: [670, 20, 1002, 692], widths: [680, 1002, 1536], matte: { lo: 3, hi: 7 }, 
    bg: PALETTE.jj.oxblood, fade: { left: 160, top: 40, right: 24 },
    ops: [
      { op: 'erase', rect: [650, 180, 205, 215], feather: 40, why: 'headline “portfolio / back.”' },
      { op: 'erase', circle: [1481, 430, 92], feather: 12, why: 'voice orb (rebuild in CSS)' },
    ],
    placement: 'JJ callout: right ~60%, bottom-aligned to the oxblood section bottom; copy + actions on the left.',
    notes: 'Orb removed (concept px centre ≈ (1481, 430), r ≈ 80 + glow) – place the CSS orb there. Darker oxblood circle (#491614) behind the head is baked in.',
  },
  {
    id: 'jj-listener-mobile', section: 'jj', concept: C.jj, crop: [860, 30, 560, 682], widths: [420, 560, 1122], matte: { lo: 3, hi: 7 }, 
    bg: PALETTE.jj.oxblood, fade: { left: 50, top: 40, right: 40 },
    ops: [],
    placement: 'Mobile JJ: head + listening hand, full width below the copy, bottom-aligned.',
    notes: 'No orb in this crop.',
  },
  {
    id: 'footer-hand', section: 'footer', concept: C.footer, crop: [1182, 30, 490, 540], widths: [490, 980, 1254], matte: { lo: 3, hi: 7 }, 
    bg: PALETTE.footer.circle, fade: { left: 30, top: 50, bottom: 40 },
    ops: [
      { op: 'erase', rect: [1170, 280, 45, 115], feather: 8, why: 'full stop of headline' },
      { op: 'erase', poly: [[1172, 474], [1182, 471], [1224, 503], [1208, 512], [1196, 532], [1172, 524]], feather: 6, why: 'cursor' },
    ],
    placement: 'Closing invitation: right edge, vertically centred on the headline/CTA block, right-aligned (hand enters from the viewport edge).',
    notes: 'Cursor removed – rebuild as a CSS/SVG element near the fingertip if wanted. Large light circle (#e5d9cc) partially baked in; concept px ≈ centre (1295, 345), r ≈ 320.',
  },
];

// ---------- geometry helpers ----------
const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const segDist = (px, py, [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  const t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0;
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
const rectPoly = ([x, y, w, h]) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const inPoly = (x, y, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { if ((p[i][1] > y) !== (p[j][1] > y) && x < ((p[j][0] - p[i][0]) * (y - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; } return c; };
// distance OUTSIDE a shape (0 inside)
function shapeDist(s, x, y) {
  if (s.circle) return Math.max(0, Math.hypot(x - s.circle[0], y - s.circle[1]) - s.circle[2]);
  if (s.line) { let d = Infinity; for (let i = 1; i < s.line.length; i++) d = Math.min(d, segDist(x, y, s.line[i - 1], s.line[i])); return Math.max(0, d - s.width / 2); }
  const p = s.poly ?? rectPoly(s.rect);
  if (inPoly(x, y, p)) return 0;
  let d = Infinity; for (let i = 0; i < p.length; i++) d = Math.min(d, segDist(x, y, p[i], p[(i + 1) % p.length]));
  return d;
}
const coverage = (s, x, y) => { const d = shapeDist(s, x, y); return s.feather ? 1 - smooth(0, s.feather, d) : d <= 0 ? 1 : 0; };

// Onion-peel inpaint: fill masked pixels from the outside in with the mean of known neighbours.
function inpaint(rgb, W, H, mask) {
  let todo = []; for (let i = 0; i < W * H; i++) if (mask[i]) todo.push(i);
  while (todo.length) {
    const next = [], fill = [];
    for (const i of todo) {
      const x = i % W, y = (i / W) | 0; let r = 0, g = 0, b = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const X = x + dx, Y = y + dy; if ((!dx && !dy) || X < 0 || Y < 0 || X >= W || Y >= H) continue;
        const j = Y * W + X; if (mask[j]) continue; r += rgb[j * 3]; g += rgb[j * 3 + 1]; b += rgb[j * 3 + 2]; n++;
      }
      if (n) fill.push([i, r / n, g / n, b / n]); else next.push(i);
    }
    if (!fill.length) break;
    for (const [i, r, g, b] of fill) { rgb[i * 3] = r; rgb[i * 3 + 1] = g; rgb[i * 3 + 2] = b; mask[i] = 0; }
    todo = next;
  }
}

// Least-squares plane per channel through ground samples: the masters' flat grounds carry a faint
// gradient, so a single colour would leave a ramp of residual alpha. (A quadratic extrapolates badly
// into corners the artwork covers.)
function fitGround(rgb, w, h) {
  const border = [];
  for (let x = 0; x < w; x += 2) border.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y += 2) border.push(y * w, y * w + w - 1);
  const g0 = [0, 1, 2].map((ch) => { const v = border.map((i) => rgb[i * 3 + ch]).sort((p, q) => p - q); return v[v.length >> 1]; });
  const basis = (x, y) => [1, x / w - 0.5, y / h - 0.5];
  let model = [0, 1, 2].map((ch) => [g0[ch], 0, 0]);
  const at = (m, x, y) => { const b = basis(x, y); return m.map((c) => c.reduce((n, k, j) => n + k * b[j], 0)); };
  for (const tol of [24, 10]) {
    const A = Array.from({ length: 3 }, () => new Float64Array(3)), B = [0, 1, 2].map(() => new Float64Array(3));
    for (let y = 0; y < h; y += 4) for (let x = 0; x < w; x += 4) {
      const i = y * w + x, g = at(model, x, y);
      if (Math.max(...[0, 1, 2].map((ch) => Math.abs(rgb[i * 3 + ch] - g[ch]))) >= tol) continue;
      const b = basis(x, y);
      for (let r = 0; r < 3; r++) { for (let c = 0; c < 3; c++) A[r][c] += b[r] * b[c]; for (let ch = 0; ch < 3; ch++) B[ch][r] += b[r] * rgb[i * 3 + ch]; }
    }
    model = B.map((rhs) => { // Gauss–Jordan on a copy of the 3×3 normal equations
      const M = A.map((row, r) => [...row, rhs[r]]);
      for (let c = 0; c < 3; c++) {
        let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
        [M[c], M[p]] = [M[p], M[c]];
        for (let r = 0; r < 3; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]; }
      }
      return M.map((row, r) => row[3] / row[r]);
    });
  }
  return (x, y) => at(model, x, y);
}

// Key a master's flat ground to alpha. Ground = everything within `hi` of the fitted ground colour
// that is connected to the image border, plus small enclosed ground-coloured holes (inside halftone
// squares). Edge pixels get alpha from their distance relative to the strongest neighbour and are
// un-mixed from the ground colour, so dots and marble edges keep their colour without a light halo.
function matte(rgb, alpha, w, h, { lo, hi, hole = 600 }) {
  const ground = fitGround(rgb, w, h);
  const G = new Float32Array(w * h * 3), d = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, g = ground(x, y);
    let m = 0; for (let ch = 0; ch < 3; ch++) { G[i * 3 + ch] = g[ch]; m = Math.max(m, Math.abs(rgb[i * 3 + ch] - g[ch])); }
    d[i] = m;
  }
  const bg = new Uint8Array(w * h); // 1 = ground
  const flood = (seeds, mark) => { const q = seeds; while (q.length) { const i = q.pop(); const x = i % w, y = (i / w) | 0; for (const j of [x > 0 && i - 1, x < w - 1 && i + 1, y > 0 && i - w, y < h - 1 && i + w]) if (j !== false && !bg[j] && d[j] < hi) { bg[j] = mark; q.push(j); } } };
  // Seed only from long flat runs (or flat 9×9 patches) along the border, so a highlight where the artwork is cut by the
  // frame edge cannot leak the ground into the figure.
  const seeds = [];
  const edges = [
    Array.from({ length: w }, (_, x) => x), Array.from({ length: w }, (_, x) => (h - 1) * w + x),
    Array.from({ length: h }, (_, y) => y * w), Array.from({ length: h }, (_, y) => y * w + w - 1),
  ];
  const flatAround = (i) => { const x = i % w, y = (i / w) | 0; for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < w && Y < h && d[Y * w + X] >= lo) return false; } return true; };
  for (const edge of edges) {
    let run = [];
    for (const i of [...edge, -1]) {
      if (i >= 0 && d[i] < lo) { run.push(i); continue; }
      for (const j of run) if (run.length >= 24 || flatAround(j)) { bg[j] = 1; seeds.push(j); }
      run = [];
    }
  }
  flood(seeds, 1);
  // enclosed holes: small, near-flat ground-coloured components
  for (let s = 0; s < w * h; s++) {
    if (bg[s] || d[s] >= lo) continue;
    bg[s] = 2; const comp = [s], q = [s];
    while (q.length) { const i = q.pop(); const x = i % w, y = (i / w) | 0; for (const j of [x > 0 && i - 1, x < w - 1 && i + 1, y > 0 && i - w, y < h - 1 && i + w]) if (j !== false && !bg[j] && d[j] < hi) { bg[j] = 2; comp.push(j); q.push(j); } }
    // A real hole (the ground inside a halftone square) is flat and ringed by strong ink;
    // a marble highlight is ringed by stone close to the ground colour.
    let ring = 0, rn = 0;
    for (const i of comp) { const x = i % w, y = (i / w) | 0; for (const j of [x > 0 && i - 1, x < w - 1 && i + 1, y > 0 && i - w, y < h - 1 && i + w]) if (j !== false && bg[j] !== 2) { ring += d[j]; rn++; } }
    const flat = comp.reduce((n, i) => n + d[i], 0) / comp.length < lo && rn > 0 && ring / rn > hi * 3;
    for (const i of comp) bg[i] = comp.length >= 6 && comp.length <= hole && flat ? 1 : 3; // 3 = visited, kept opaque
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    let near = bg[i] === 1, dl = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
      const j = Y * w + X; if (bg[j] === 1) near = true; dl = Math.max(dl, d[j]);
    }
    if (!near) continue;
    const k = dl >= hi * 1.5 ? Math.min(1, Math.max(0, (d[i] - lo) / (dl - lo))) : bg[i] === 1 ? smooth(lo, hi, d[i]) : 1;
    alpha[i] *= k;
    if (k > 0.02 && k < 1) for (let ch = 0; ch < 3; ch++) rgb[i * 3 + ch] = G[i * 3 + ch] + (rgb[i * 3 + ch] - G[i * 3 + ch]) / k;
    else if (k <= 0.02) for (let ch = 0; ch < 3; ch++) rgb[i * 3 + ch] = G[i * 3 + ch];
  }
}

async function build(a) {
  const masterPath = path.join(masterDir, `${a.master ?? a.id}.png`);
  const useMaster = await fs.access(masterPath).then(() => true, () => false);
  const [L, T, W, H] = useMaster ? [0, 0, 0, 0] : a.crop;
  let rgb, w, h;
  if (useMaster) {
    let img = sharp(masterPath).removeAlpha();
    if (a.masterCrop) { const [left, top, width, height] = a.masterCrop; img = img.extract({ left, top, width, height }); }
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    rgb = new Float32Array(data); w = info.width; h = info.height;
  } else {
    const { data } = await sharp(path.join(conceptDir, a.concept)).removeAlpha().extract({ left: L, top: T, width: W, height: H }).raw().toBuffer({ resolveWithObject: true });
    rgb = new Float32Array(data); w = W; h = H;
  }
  const alpha = new Float32Array(w * h).fill(1);
  const ops = useMaster ? [] : a.ops;
  const bgc = hexToRgb(a.bg ?? '#000000');
  for (const s of ops) {
    if (s.op === 'paint') {
      const c = hexToRgb(s.color);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = coverage(s, x + L, y + T); if (!k) continue; const i = (y * w + x) * 3; for (let ch = 0; ch < 3; ch++) rgb[i + ch] += (c[ch] - rgb[i + ch]) * k; }
    } else if (s.op === 'inpaint') {
      const mask = new Uint8Array(w * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (shapeDist(s, x + L, y + T) <= 0) mask[y * w + x] = 1;
      inpaint(rgb, w, h, mask);
    } else if (s.op === 'key') {
      // colour-to-alpha against a flat background colour, thresholded to ignore paper/stone grain
      const c = hexToRgb(s.color);
      for (let i = 0; i < w * h; i++) {
        let raw = 0; for (let ch = 0; ch < 3; ch++) { const p = rgb[i * 3 + ch]; raw = Math.max(raw, p > c[ch] ? (p - c[ch]) / (255 - c[ch]) : (c[ch] - p) / c[ch]); }
        const k = smooth(s.lo, s.hi, raw); alpha[i] *= k;
        if (raw > 0) for (let ch = 0; ch < 3; ch++) { const v = (rgb[i * 3 + ch] - (1 - raw) * c[ch]) / raw; rgb[i * 3 + ch] = rgb[i * 3 + ch] + (Math.max(0, Math.min(255, v)) - rgb[i * 3 + ch]) * (1 - k * k); }
      }
    } else if (s.op === 'erase') {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = coverage(s, x + L, y + T); if (!k) continue; const i = y * w + x; alpha[i] *= 1 - k; for (let ch = 0; ch < 3; ch++) rgb[i * 3 + ch] += (bgc[ch] - rgb[i * 3 + ch]) * k; } // also scrub hidden RGB so removed text can't resurface
    }
  }
  if (useMaster && a.matte) matte(rgb, alpha, w, h, a.matte);
  const f = (useMaster && a.masterFade) || a.fade || {};
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let k = 1;
    if (f.left) k *= smooth(0, f.left, x); if (f.right) k *= smooth(0, f.right, w - 1 - x);
    if (f.top) k *= smooth(0, f.top, y); if (f.bottom) k *= smooth(0, f.bottom, h - 1 - y);
    alpha[y * w + x] *= k;
  }
  const opaque = a.opaque;
  const buf = Buffer.alloc(w * h * (opaque ? 3 : 4));
  for (let i = 0; i < w * h; i++) {
    const o = i * (opaque ? 3 : 4);
    for (let ch = 0; ch < 3; ch++) buf[o + ch] = Math.max(0, Math.min(255, Math.round(rgb[i * 3 + ch])));
    if (!opaque) buf[o + 3] = Math.round(alpha[i] * 255);
  }
  const raw = { raw: { width: w, height: h, channels: opaque ? 3 : 4 } };
  const dir = path.join(outRoot, a.section);
  await fs.mkdir(dir, { recursive: true });
  const files = [];
  for (const width of [...new Set(a.widths.map((x) => Math.min(x, w)))]) {
    for (const format of ['avif', 'webp']) {
      const name = `${a.id}-${width}.${format}`;
      const opts = format === 'avif' ? { quality: 44, effort: 6 } : { quality: 80, alphaQuality: 90, effort: 6 };
      const info = await sharp(buf, raw).resize({ width }).toFormat(format, opts).toFile(path.join(dir, name));
      files.push({ path: `public/roman-v2/${a.section}/${name}`, url: `/roman-v2/${a.section}/${name}`, format, width: info.width, height: info.height, bytes: info.size });
    }
  }
  if (previewDir) {
    await fs.mkdir(previewDir, { recursive: true });
    const bg = a.bg ? hexToRgb(a.bg) : [255, 255, 255];
    await sharp(buf, raw).flatten({ background: { r: bg[0], g: bg[1], b: bg[2] } }).png().toFile(path.join(previewDir, `${a.id}.png`));
    if (!opaque) await sharp(buf, raw).flatten({ background: { r: 255, g: 0, b: 255 } }).png().toFile(path.join(previewDir, `${a.id}-magenta.png`));
  }
  const entry = {
    id: a.id, section: a.section, alt: '', decorative: true, status: useMaster ? 'regenerated master' : STATUS,
    files, sourcePixels: { width: w, height: h }, hasAlpha: !opaque,
    placement: a.placement,
    fade: opaque ? null : { sides: Object.fromEntries(Object.entries(f).map(([k, v]) => [k, `${v}px`])), fadesTo: 'transparent (alpha)', intendedBackground: a.bg },
    sectionBackgroundSampled: a.bg,
    transparency: opaque ? 'opaque' : useMaster && a.matte ? `master ground keyed to alpha (lo ${a.matte.lo}, hi ${a.matte.hi}) plus edge fades` : 'edge fades only',
    source: useMaster ? { master: path.relative(root, masterPath), ...(a.masterCrop && { crop: Object.fromEntries(['left', 'top', 'width', 'height'].map((k, i) => [k, a.masterCrop[i]])) }) } : { concept: `design/roman-v2/concepts/${a.concept}`, crop: { left: L, top: T, width: W, height: H } },
    cleanup: ops.map((s) => `${s.op}: ${s.why}`),
    notes: useMaster ? (a.masterNotes ?? a.notes) : a.notes,
  };
  if (a.id === 'projects-frame' && !useMaster) {
    const win = a.ops.find((s) => s.op === 'erase').poly.map(([x, y]) => [x - L, y - T]);
    const xs = win.map((p) => p[0]), ys = win.map((p) => p[1]);
    entry.window = { description: 'Transparent window for the real product screenshot, in px of the full-width export; place the screenshot BEHIND the layer covering this box.', polygon: win, bbox: { left: Math.min(...xs), top: Math.min(...ys), right: Math.max(...xs), bottom: Math.max(...ys) }, bboxPercent: { left: +(Math.min(...xs) / w * 100).toFixed(1), top: +(Math.min(...ys) / h * 100).toFixed(1), right: +(Math.max(...xs) / w * 100).toFixed(1), bottom: +(Math.max(...ys) / h * 100).toFixed(1) } };
  }
  return entry;
}

const assets = [];
for (const a of ASSETS) assets.push(await build(a));
const manifest = {
  version: 1,
  generated: new Date().toISOString().slice(0, 10),
  script: 'scripts/prepare-roman-v2-assets.mjs',
  provenance: 'Mixed pipeline: approved generated masters are used when present; remaining small support assets are cropped from approved concepts and marked interim per asset.',
  status: assets.every((a) => a.status === 'regenerated master') ? 'all regenerated masters' : 'mixed – regenerated masters plus explicitly marked interim support assets',
  palette: PALETTE,
  cssRecommendations: ['Large section circles, rules, grain and the JJ voice orb are CSS, not raster.', 'Use <picture> with AVIF then WebP; alt=""; aria-hidden; lazy-load all but hero.'],
  assets,
};
await fs.mkdir(path.join(root, 'design/roman-v2/assets'), { recursive: true });
await fs.writeFile(path.join(root, 'design/roman-v2/assets/manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const all = assets.flatMap((a) => a.files);
console.log(JSON.stringify({ assets: assets.length, files: all.length, totalKB: Math.round(all.reduce((n, f) => n + f.bytes, 0) / 1024), maxWebpKB: Math.round(Math.max(...all.filter((f) => f.format === 'webp').map((f) => f.bytes)) / 1024) }));
