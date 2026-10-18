// Roman v2 motion: knob layers for code rotation (MusicKnob.tsx), cut from the current beyond-music strip.
//
// Run: node scripts/roman-v2-motion-knob.mjs
//
// Every layer is a transparent lossless WebP at the strip's full size (536×215), on the strip's pixel grid:
//   plate      the strip with the knob face replaced by its notch-free, rotationally symmetric version
//   face       that symmetric face + an engraved notch; transparent outside the face ellipse (the only layer that turns)
//   highlight  the still's own specular streaks over the symmetric face (fixed to the light, never turns); under the
//              fingers, filled from the same angle elsewhere on the face
//   fingers    the index and thumb tips where they overlap the face (feathered just outside it)
// The face is an ellipse (a disc seen from the left), so the page turns it as scaleY(s) rotate() scaleY(1/s)
// with s = ry/rx. At 0° plate+face+highlight+fingers reproduces the strip exactly except for the notch.
// Also writes the `knob` key into src/lib/roman-v2/motion.json and QA composites (0/90/180°) into
// design/roman-v2/motion/encode-qa/knob-*.png.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const SRC = path.join(root, "design/roman-v2/assets/masters/beyond-music.png");
const OUT = path.join(root, "public/roman-v2/motion/beyond");
const QA = path.join(root, "design/roman-v2/motion/encode-qa");
const URL = "/roman-v2/motion/beyond";

// Face ellipse, measured on the strip (px). s = ry / rx.
const CX = 457.5, CY = 94, RX = 28, RY = 32.5, S = RY / RX;
const NOTCH = { angle: -10, from: 0.34, to: 0.88, half: 1.3, depth: 0.85 }; // degrees from +x (screen, y down); radii as fraction of RX
const FINGER_SEEDS = [[420, 40], [410, 125]]; // index finger, thumb
const WARM = 16;
const HI_CAP = Number(process.env.KNOB_HI_CAP ?? 0.6); // max highlight alpha
const hiStats = []; // R−B above this = skin

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H;
if (W !== 536 || H !== 215) throw new Error(`beyond-music master is ${W}×${H}, expected 536×215`);

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
// unsquashed radius / angle of a pixel centre
const polar = (x, y) => { const u = x + 0.5 - CX, v = (y + 0.5 - CY) / S; return [Math.hypot(u, v), Math.atan2(v, u)]; };

// ---- finger mask: skin pixels connected to the seeds, holes filled, soft edge ----
const warm = new Uint8Array(N);
for (let i = 0; i < N; i++) warm[i] = data[i * 3] - data[i * 3 + 2] > WARM ? 1 : 0;
const skin = new Uint8Array(N);
const stack = [];
for (const [x, y] of FINGER_SEEDS) { const i = y * W + x; if (!warm[i]) throw new Error(`seed ${x},${y} is not skin`); skin[i] = 1; stack.push(i); }
while (stack.length) {
  const i = stack.pop(), x = i % W, y = (i / W) | 0;
  for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1]) if (j >= 0 && warm[j] && !skin[j]) { skin[j] = 1; stack.push(j); }
}
// fill enclosed holes (thumbnail highlight): flood the non-skin from the border, the rest is skin
const outside = new Uint8Array(N);
for (let x = 0; x < W; x++) for (const y of [0, H - 1]) if (!skin[y * W + x]) { outside[y * W + x] = 1; stack.push(y * W + x); }
for (let y = 0; y < H; y++) for (const x of [0, W - 1]) if (!skin[y * W + x]) { outside[y * W + x] = 1; stack.push(y * W + x); }
while (stack.length) {
  const i = stack.pop(), x = i % W, y = (i / W) | 0;
  for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1]) if (j >= 0 && !skin[j] && !outside[j]) { outside[j] = 1; stack.push(j); }
}
// soft skin alpha: 1 inside, edge pixels (skin next to non-skin) weighted by warmth
const F = new Float32Array(N);
for (let i = 0; i < N; i++) {
  if (outside[i]) continue;
  F[i] = 1;
}
for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
  const i = y * W + x;
  const edge = outside[i] !== outside[i - 1] || outside[i] !== outside[i + 1] || outside[i] !== outside[i - W] || outside[i] !== outside[i + W];
  if (edge) F[i] = Math.max(F[i], smooth(6, WARM + 10, data[i * 3] - data[i * 3 + 2]));
}

// ---- symmetric face: radial profile of the face (skin excluded) ----
const BIN = 0.5, NB = Math.ceil((RX + 2) / BIN) + 1;
const sum = Array.from({ length: NB }, () => [0, 0, 0, 0]);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x, [r] = polar(x, y);
  if (r > RX - 1.5 || F[i] > 0) continue;
  const b = sum[Math.round(r / BIN)];
  for (let ch = 0; ch < 3; ch++) b[ch] += data[i * 3 + ch];
  b[3]++;
}
let last = null;
const prof = sum.map((b) => (b[3] ? (last = b.slice(0, 3).map((v) => v / b[3])) : null));
for (let k = NB - 1; k >= 0; k--) if (!prof[k]) prof[k] = prof[k + 1] ?? last; // fill gaps outward / at the rim
for (let k = 0; k < NB; k++) if (!prof[k]) prof[k] = prof[k - 1];
const profileAt = (r) => { const t = clamp(r / BIN, 0, NB - 1), k = Math.floor(t), f = t - k, a = prof[k], b = prof[Math.min(NB - 1, k + 1)]; return [0, 1, 2].map((ch) => a[ch] * (1 - f) + b[ch] * f); };

// coverage of the face ellipse for a pixel (4×4 supersampled)
const faceCover = (x, y) => { let c = 0; for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) { const u = x + (sx + 0.5) / 4 - CX, v = (y + (sy + 0.5) / 4 - CY) / S; if (u * u + v * v <= RX * RX) c++; } return c / 16; };

// engraved notch (in unsquashed face space): dark groove + light lip on its upper-left side
const na = (NOTCH.angle * Math.PI) / 180, nd = [Math.cos(na), Math.sin(na)], nn = [-nd[1], nd[0]];
function notch(u, v) {
  const t = u * nd[0] + v * nd[1], d = u * nn[0] + v * nn[1];
  const along = smooth(NOTCH.from * RX - 0.6, NOTCH.from * RX + 0.6, t) * (1 - smooth(NOTCH.to * RX - 0.6, NOTCH.to * RX + 0.6, t));
  const groove = clamp(NOTCH.half + 0.5 - Math.abs(d)) * along;
  const lip = clamp(0.9 - Math.abs(d + NOTCH.half + 0.7)) * along; // lit edge toward the light (upper left)
  return { groove, lip };
}

const plate = Buffer.alloc(N * 4), face = Buffer.alloc(N * 4), hi = Buffer.alloc(N * 4), fingers = Buffer.alloc(N * 4);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x, o = i * 4, [r] = polar(x, y);
  const orig = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
  const cov = r < RX + 2 ? faceCover(x, y) : 0;
  const base = profileAt(Math.min(r, RX - 0.5));

  // plate: symmetric face inside the ellipse (skin kept) on the strip; transparent beyond RX+3 (the still is under it)
  if (r < RX + 3) {
    for (let ch = 0; ch < 3; ch++) plate[o + ch] = Math.round(F[i] >= 1 ? orig[ch] : cov * base[ch] + (1 - cov) * orig[ch]);
    plate[o + 3] = 255;
  }

  if (cov > 0) {
    // face: symmetric profile + notch (supersampled 4×4)
    let g = 0, l = 0;
    for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
      const u = x + (sx + 0.5) / 4 - CX, v = (y + (sy + 0.5) / 4 - CY) / S, n = notch(u, v);
      g += n.groove / 16; l += n.lip / 16;
    }
    for (let ch = 0; ch < 3; ch++) face[o + ch] = Math.round(clamp(base[ch] * (1 - NOTCH.depth * g) + (235 - base[ch]) * 0.45 * l, 0, 255));
    face[o + 3] = Math.round(cov * 255);
  }

  // highlight: the still's deviation from what plate+face (no notch) show at 0°, as one normal-blend layer.
  // Alpha is capped so the notch still reads through the strongest streaks; exact wherever the cap is not hit.
  if (cov > 0 && F[i] < 1) {
    const below = [0, 1, 2].map((ch) => cov * base[ch] + (1 - cov) * plate[o + ch]);
    let a = 0;
    for (let ch = 0; ch < 3; ch++) { const d = orig[ch] - below[ch]; a = Math.max(a, d > 0 ? d / (255 - below[ch]) : -d / below[ch]); }
    a = Math.min(HI_CAP, a);
    if (a > 0.004) {
      for (let ch = 0; ch < 3; ch++) hi[o + ch] = Math.round(clamp(below[ch] + (orig[ch] - below[ch]) / a, 0, 255));
      hi[o + 3] = Math.round(a * 255 * (1 - F[i]));
      hiStats.push(a);
    }
  }

  // fingers: skin over and just around the face (feathered out by RX+6, where the plate is the strip anyway)
  const near = 1 - smooth(RX + 2, RX + 6, r);
  if (F[i] > 0 && near > 0) {
    for (let ch = 0; ch < 3; ch++) fingers[o + ch] = orig[ch];
    fingers[o + 3] = Math.round(F[i] * near * 255);
  }
}

// Under the fingers the still has no highlight. Fill it from the same angle elsewhere on the face (the brushed streaks
// run radially), so a finger that moves away in the hand loop (roman-v2-motion-knob-hand.mjs) uncovers a whole face.
const AN = 180, bins = Array.from({ length: AN }, () => [0, 0, 0, 0, 0]);
const binOf = (x, y) => Math.min(AN - 1, Math.floor(((polar(x, y)[1] + Math.PI) / (2 * Math.PI)) * AN));
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x, o = i * 4, [r] = polar(x, y);
  if (F[i] > 0 || r < 3 || r > RX - 2) continue;
  const a = hi[o + 3] / 255, b = bins[binOf(x, y)];
  for (let ch = 0; ch < 3; ch++) b[ch] += hi[o + ch] * a;
  b[3] += a; b[4]++;
}
for (let k = 0; k < AN; k++) if (!bins[k][4]) bins[k] = bins[(k + AN - 1) % AN]; // (an empty bin takes its neighbour)
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x, o = i * 4, [r] = polar(x, y);
  if (!F[i] || r >= RX + 2) continue;
  const cov = faceCover(x, y);
  if (!cov) continue;
  const b = bins[binOf(x, y)], fa = Math.min(HI_CAP, b[3] / b[4]) * F[i], ha = hi[o + 3] / 255, a = ha + fa;
  if (a < 0.004) continue;
  for (let ch = 0; ch < 3; ch++) hi[o + ch] = Math.round((hi[o + ch] * ha + (b[3] ? b[ch] / b[3] : 0) * fa) / a);
  hi[o + 3] = Math.round(a * 255);
}

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(QA, { recursive: true });
const raw = { raw: { width: W, height: H, channels: 4 } };
const layers = { plate, face, highlight: hi, fingers };
const files = {};
for (const [name, buf] of Object.entries(layers)) {
  const file = path.join(OUT, `knob-${name}.webp`);
  await sharp(buf, raw).webp({ lossless: true, effort: 6 }).toFile(file);
  files[name] = { url: `${URL}/knob-${name}.webp`, bytes: (await fs.stat(file)).size };
}

// ---- QA: composite exactly like the page (plate, face turned by S·R·S⁻¹ about the centre, highlight, fingers) ----
function turned(buf, deg) {
  const out = Buffer.alloc(N * 4), c = Math.cos((deg * Math.PI) / 180), s = Math.sin((deg * Math.PI) / 180);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    // inverse: p_src = S · R(−θ) · S⁻¹ · (p − c) + c
    const px = x + 0.5 - CX, py = (y + 0.5 - CY) / S;
    const sx = c * px + s * py + CX - 0.5, sy = (-s * px + c * py) * S + CY - 0.5;
    const x0 = Math.floor(sx), y0 = Math.floor(sy), fx = sx - x0, fy = sy - y0;
    const acc = [0, 0, 0, 0];
    for (const [dx, dy, w] of [[0, 0, (1 - fx) * (1 - fy)], [1, 0, fx * (1 - fy)], [0, 1, (1 - fx) * fy], [1, 1, fx * fy]]) {
      const X = x0 + dx, Y = y0 + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const j = (Y * W + X) * 4, a = buf[j + 3] / 255;
      for (let ch = 0; ch < 3; ch++) acc[ch] += buf[j + ch] * a * w;
      acc[3] += a * w;
    }
    const o = (y * W + x) * 4;
    for (let ch = 0; ch < 3; ch++) out[o + ch] = acc[3] > 0 ? Math.round(acc[ch] / acc[3]) : 0;
    out[o + 3] = Math.round(acc[3] * 255);
  }
  return out;
}
const qa = {};
const strip = await sharp(SRC).removeAlpha().ensureAlpha().raw().toBuffer();
const sheet = [];
for (const deg of [0, 45, 90, 135, 180, 225, 270, 315]) {
  const comp = await sharp(strip, raw).composite([plate, turned(face, deg), hi, fingers].map((b) => ({ input: b, raw: raw.raw }))).raw().toBuffer();
  if (deg === 0) {
    // outside the notch the stack must reproduce the strip
    let err = 0, n = 0, max = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, u = x + 0.5 - CX, v = (y + 0.5 - CY) / S;
      const n0 = notch(u, v); if (n0.groove + n0.lip > 0 || Math.hypot(u, v) > RX + 8) continue;
      for (let ch = 0; ch < 3; ch++) { const d = Math.abs(comp[i * 4 + ch] - data[i * 3 + ch]); err += d; max = Math.max(max, d); n++; }
    }
    qa.zeroDegMeanAbsDiff = +(err / n).toFixed(3);
    qa.zeroDegMaxDiff = max;
    const diff = Buffer.alloc(N);
    for (let i = 0; i < N; i++) for (let ch = 0; ch < 3; ch++) diff[i] = Math.max(diff[i], Math.min(255, 4 * Math.abs(comp[i * 4 + ch] - data[i * 3 + ch])));
    await sharp(diff, { raw: { width: W, height: H, channels: 1 } }).extract({ left: 400, top: 20, width: 136, height: 130 }).resize(816, 780, { kernel: "nearest" }).png().toFile(path.join(QA, "knob-0-diff-6x.png"));
  }
  if (deg % 90 === 0) await sharp(comp, raw).removeAlpha().png().toFile(path.join(QA, `knob-${deg}.png`));
  sheet.push(await sharp(comp, raw).removeAlpha().extract({ left: 410, top: 40, width: 100, height: 100 }).resize(400, 400, { kernel: "nearest" }).png().toBuffer());
}
// contact sheet: 0…315° in 45° steps, 4× zoom
await sharp({ create: { width: 1600, height: 800, channels: 3, background: "#000" } })
  .composite(sheet.map((input, k) => ({ input, left: (k % 4) * 400, top: Math.floor(k / 4) * 400 }))).png().toFile(path.join(QA, "knob-sheet-4x.png"));

// ---- manifest ----
const manifestFile = path.join(root, "src/lib/roman-v2/motion.json");
const manifest = JSON.parse(await fs.readFile(manifestFile, "utf8"));
manifest.knob = {
  size: [W, H],
  center: [CX, CY],
  face: files.face.url,
  plate: files.plate.url,
  highlight: files.highlight.url,
  fingers: files.fingers.url,
  scaleY: +S.toFixed(4),
  ...(manifest.knob?.track && { track: manifest.knob.track }), // the hand loop's sync track (roman-v2-motion-knob-hand.mjs)
};
await fs.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
hiStats.sort((p, q) => p - q);
qa.highlightAlpha = { p50: +hiStats[hiStats.length >> 1].toFixed(3), p90: +hiStats[Math.floor(hiStats.length * 0.9)].toFixed(3), capped: hiStats.filter((a) => a >= HI_CAP).length, of: hiStats.length };
console.log(JSON.stringify({ knob: manifest.knob, bytes: Object.fromEntries(Object.entries(files).map(([k, v]) => [k, v.bytes])), qa }, null, 1));
