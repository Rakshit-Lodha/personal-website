// Roman v2 motion: the music card's hand loop (`beyond-knob-hand`) + the knob's sync track (`knob.track`).
//
// Run: node scripts/roman-v2-motion-knob-hand.mjs        (after scripts/roman-v2-motion-knob.mjs)
//
// The Veo take for this shot (shots.json `beyond-knob-hand`) could not be generated (OpenRouter credits ran out), so
// the loop is rendered from the strip itself. The hand is cut out as its own layer and twists about the knob axis with
// a falloff from the fingertips to the wrist (fingertips turn the full angle, the knuckles a few degrees, nothing
// beyond MOVE px); it is composited over a plate of the strip with the hand's moving part removed and rebuilt, so the
// knob rim, tick ring, panel and halftone never move. Frame 0 and the loop seam rebuild the strip, so nothing ghosts
// against the still.
//
// One cycle per 4 s at 24 fps: grip (0–0.4 s), twist clockwise TWIST° (0.4–2.0 s), release (fingertips lift
// LIFT px off the rim, 2.0–2.4 s), ease back (2.4–3.6 s), re-grip (3.6–4.0 s).
//
// Output (one alpha video, so the hand and the fingertips over the knob can't drift apart):
//   the full strip, opaque, except a window over the knob face (inset 1 px) where no finger covers it. On the page
//   the code knob (face + highlight, MusicKnob.tsx) sits under the video and shows through that window, so the
//   fingertips are always on top of the turning face.
//   Encoded at 2× (1072×430: HEVC needs even sizes and 215 is odd), WebM VP9 alpha + HEVC alpha (hvc1), ≤ 250 KB each.
// Sync track: the index fingertip's contact angle around the knob axis is measured on every rendered frame (skin key
// in a band on the rim); the knob advances by that angle while the fingertip turns clockwise and holds otherwise.
// Written to motion.json `knob.track = { fps, angles }` (degrees, non-decreasing; angles[0] = 0; one loop = the last
// value). Also adds the clip to the manifest and writes QA images to design/roman-v2/motion/encode-qa/knob-hand-*.
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const FFMPEG = "/opt/homebrew/bin/ffmpeg";
const FFPROBE = "/opt/homebrew/bin/ffprobe";
const root = process.cwd();
const SRC = path.join(root, "design/roman-v2/assets/masters/beyond-music.png");
const OUT = path.join(root, "public/roman-v2/motion/beyond");
const QA = path.join(root, "design/roman-v2/motion/encode-qa");
const ID = "beyond-knob-hand";
// --take <mp4>: build the loop from a Veo take of shots.json `beyond-knob-hand` instead of the 2D twist.
const TAKE = (() => { const i = process.argv.indexOf("--take"); return i === -1 ? null : process.argv[i + 1]; })();
const QA_PREFIX = TAKE ? "knob-hand-veo" : "knob-hand";
const KB = 1024;
const BUDGET = 250 * KB;

// Knob geometry (strip px), as in roman-v2-motion-knob.mjs.
const CX = 457.5, CY = 94, RX = 28, RY = 32.5, S = RY / RX;
const FINGER_SEEDS = [[420, 40], [410, 125]]; // index finger, thumb
const WARM = 16; // R−B above this = marble/skin

const FPS = 24, SECONDS = 4, FRAMES = FPS * SECONDS, SCALE = 2;
const TWIST = 28; // degrees clockwise at the fingertips
const LIFT = 1.5; // px the fingertips lift off the rim while easing back
const FULL = 40, MOVE = 130; // twist falloff: full inside FULL px of the axis, (FULL/r)² beyond, 0 from MOVE out

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2); // easeInOutCubic

/** Twist angle (deg) and fingertip lift (px) at time t (s). */
function pose(t) {
  const k = (a, b) => ease(clamp((t - a) / (b - a)));
  const angle = TWIST * (k(0.4, 2.0) - k(2.4, 3.6));
  const lift = LIFT * (k(2.0, 2.4) - k(3.6, 4.0));
  return { angle, lift };
}

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H;
if (W !== 536 || H !== 215) throw new Error(`beyond-music master is ${W}×${H}, expected 536×215`);
const W2 = W * SCALE, H2 = H * SCALE, N2 = W2 * H2;
const big = await sharp(SRC).removeAlpha().resize(W2, H2, { kernel: "lanczos3" }).raw().toBuffer();

const radius = (x, y) => Math.hypot(x + 0.5 - CX, (y + 0.5 - CY) / S); // un-squashed distance from the knob axis

// ---- hand mask: warm pixels connected to the finger seeds, holes filled (the knob layers' rule) ----
// On the knob face the brushed highlight next to the thumb reaches R−B 16–19, so the key is stricter there (the pale
// thumbnail it also drops is enclosed by the thumb and comes back with the holes).
const warm = (i) => data[i * 3] - data[i * 3 + 2] > (radius(i % W, (i / W) | 0) < RX + 2 ? 19 : WARM);
const skin = new Uint8Array(N), outside = new Uint8Array(N);
const flood = (seen, ok, seeds) => {
  const stack = [...seeds];
  for (const i of seeds) seen[i] = 1;
  while (stack.length) {
    const i = stack.pop(), x = i % W, y = (i / W) | 0;
    for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1])
      if (j >= 0 && !seen[j] && ok(j)) { seen[j] = 1; stack.push(j); }
  }
};
flood(skin, warm, FINGER_SEEDS.map(([x, y]) => y * W + x));
const border = [];
for (let x = 0; x < W; x++) border.push(x, (H - 1) * W + x);
for (let y = 0; y < H; y++) border.push(y * W, y * W + W - 1);
flood(outside, (j) => !skin[j], border.filter((i) => !skin[i]));
const F = new Float32Array(N); // soft finger alpha
for (let i = 0; i < N; i++) if (!outside[i]) F[i] = 1;
for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
  const i = y * W + x;
  if (outside[i] !== outside[i - 1] || outside[i] !== outside[i + 1] || outside[i] !== outside[i - W] || outside[i] !== outside[i + W])
    F[i] = Math.max(F[i], smooth(6, WARM + 10, data[i * 3] - data[i * 3 + 2]));
}
// Separable helpers on single-channel 1× float images.
function separable(src, r, reduce) {
  const tmp = new Float32Array(N), out = new Float32Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) tmp[y * W + x] = reduce((k) => src[y * W + k], Math.max(0, x - r), Math.min(W - 1, x + r));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out[y * W + x] = reduce((k) => tmp[k * W + x], Math.max(0, y - r), Math.min(H - 1, y + r));
  return out;
}
const max = (get, a, b) => { let m = 0; for (let k = a; k <= b; k++) m = Math.max(m, get(k)); return m; };
const mean = (get, a, b) => { let s = 0; for (let k = a; k <= b; k++) s += get(k); return s / (b - a + 1); };

// ---- background plate: the strip with the moving part of the hand removed ----
// Only the hand moves (as its own layer); everything behind it stays put, so the knob rim, the tick ring and the
// panel never warp. Where the hand will uncover them, the plate is rebuilt: around the knob from its radial profile
// (taken from the unoccluded left half, which is lit the same way), on the panel by normalized convolution.
const hard = separable(F.map((v) => (v > 0.5 ? 1 : 0)), 1, max);
const known = Float32Array.from(hard, (h) => 1 - h), filled = new Uint8Array(N);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) filled[y * W + x] = hard[y * W + x] && radius(x, y) < MOVE + 2 ? 1 : 0;
// panel: normalized convolution at two scales (the wide one only where the narrow one has nothing to go on)
const panel = [0, 1, 2].map(() => new Float32Array(N));
for (const r of [8, 24]) {
  const blurR = (src) => separable(separable(separable(src, r, mean), r, mean), r, mean);
  const den = blurR(known);
  for (let c = 0; c < 3; c++) {
    const num = blurR(Float32Array.from(known, (k, i) => k * data[i * 3 + c]));
    for (let i = 0; i < N; i++) if (r === 8 ? den[i] > 0.02 : !(panel[c][i] > 0)) panel[c][i] = num[i] / Math.max(1e-6, den[i]);
  }
}
const PB = 0.5, PN = Math.ceil((RX + 34) / PB);
const prof = Array.from({ length: PN }, () => [0, 0, 0, 0]);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x, r = radius(x, y);
  if (!known[i] || hard[i] || x + 0.5 >= CX || r >= RX + 34) continue;
  const b = prof[Math.floor(r / PB)];
  for (let c = 0; c < 3; c++) b[c] += data[i * 3 + c];
  b[3]++;
}
for (let k = 0; k < PN; k++) if (!prof[k][3]) prof[k] = (prof[k - 1] ?? [0, 0, 0, 1]).slice(); // (a gap takes the bin inside it)
const plate = Buffer.from(data);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x;
  if (!filled[i]) continue;
  const r = radius(x, y), b = prof[Math.min(PN - 1, Math.floor(r / PB))], t = smooth(RX + 24, RX + 32, r);
  for (let c = 0; c < 3; c++) plate[i * 3 + c] = Math.round(clamp((1 - t) * (b[c] / b[3]) + t * panel[c][i], 0, 255));
}
// The hand as a premultiplied layer (colour from the strip, alpha F). Over the plate at rest it rebuilds the strip.
const handRGB = Buffer.alloc(N * 3), handA = Buffer.alloc(N);
for (let i = 0; i < N; i++) {
  for (let c = 0; c < 3; c++) handRGB[i * 3 + c] = Math.round(data[i * 3 + c] * F[i]);
  handA[i] = Math.round(F[i] * 255);
}
// (Colour and alpha are resized as separate plain images: sharp would premultiply a 4-channel image a second time.)
const up = (buf, channels) => {
  const img = sharp(buf, { raw: { width: W, height: H, channels } }).resize(W2, H2, { kernel: "lanczos3" });
  return (channels === 1 ? img.extractChannel(0) : img).raw().toBuffer(); // (a 1-channel raw image comes back as 3)
};
const [handRGB2, handA2] = [await up(handRGB, 3), await up(handA, 1)];
const hand2 = Buffer.alloc(N2 * 4);
for (let i = 0; i < N2; i++) {
  for (let c = 0; c < 3; c++) hand2[i * 4 + c] = Math.min(handRGB2[i * 3 + c], handA2[i]);
  hand2[i * 4 + 3] = handA2[i];
}
const plate2 = await up(plate, 3);
await fs.mkdir(QA, { recursive: true });
await sharp(plate, { raw: { width: W, height: H, channels: 3 } }).extract({ left: 300, top: 0, width: 236, height: 215 }).resize(708, 645, { kernel: "nearest" }).png().toFile(path.join(QA, "knob-hand-plate.png"));

// ---- render ----
const bilinear = (buf, w, h, ch, x, y, out) => {
  x = clamp(x, 0, w - 1.001); y = clamp(y, 0, h - 1.001);
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const i00 = (y0 * w + x0) * ch, i10 = i00 + ch, i01 = i00 + w * ch, i11 = i01 + ch;
  for (let c = 0; c < ch; c++)
    out[c] = buf[i00 + c] * (1 - fx) * (1 - fy) + buf[i10 + c] * fx * (1 - fy) + buf[i01 + c] * (1 - fx) * fy + buf[i11 + c] * fx * fy;
  return out;
};
const falloff = (r) => (r <= FULL ? 1 : (FULL / r) ** 2) * (1 - smooth(MOVE * 0.55, MOVE, r));
// Window: the face ellipse inset by 1 px (so the code face's antialiased rim never shows the card behind it), 4×4 AA.
const insetCover = (x, y) => {
  let c = 0;
  for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
    const u = x + (sx + 0.5) / (4 * SCALE) - CX, v = (y + (sy + 0.5) / (4 * SCALE) - CY) / S;
    if (u * u + v * v <= (RX - 1) ** 2) c++;
  }
  return c / 16;
};
const cover = new Float32Array(N2);
for (let Y = 0; Y < H2; Y++) for (let X = 0; X < W2; X++) {
  const x = X / SCALE, y = Y / SCALE, u = x - CX, v = (y - CY) / S;
  if (u * u + v * v < (RX + 1) ** 2) cover[Y * W2 + X] = insetCover(x, y);
}

// ---- Veo take → frames (with --take) ----
// The take is cropped to the strip (cropToPage), scaled to 2×, and shifted by its measured drift against the strip.
// Then, as in roman-v2-motion-post/encode: wherever the take stays within codec noise of the still (blurred, 3-frame
// mean), the still is kept (lock grown 14 px, feathered 6), so only the moving hand plays. Around the knob (out to its
// tick ring) only the take's marble pixels are used; behind them is the rebuilt plate, so Veo's own knob (which
// drifts and grows) never shows. Far from the knob (the halftone and ground) the still is always kept.
async function veoFrames(take) {
  const [tw, th] = execFileSync(FFPROBE, ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", take]).toString().trim().split(",").map(Number);
  const shot = JSON.parse(await fs.readFile(path.join(root, "design/roman-v2/motion/shots.json"), "utf8")).shots.find((x) => x.id === ID);
  const [, ny, , nh] = shot.clips[0].cropToPage;
  const crop = `crop=${tw}:${Math.round(th * nh)}:0:${Math.round(th * ny)},scale=${W2}:${H2}:flags=lanczos`;
  const raw = execFileSync(FFMPEG, ["-v", "error", "-i", take, "-vf", crop, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1 << 30 });
  const count = Math.min(FRAMES, Math.floor(raw.length / (N2 * 3)));
  if (count < FRAMES) throw new Error(`${take}: ${count} frames, expected ${FRAMES}`);
  const frame = (f) => raw.subarray(f * N2 * 3, (f + 1) * N2 * 3);
  // integer drift (2× px) of frame 0 against the strip, on the static right half and the left ground
  const grey = (b, i) => b[i * 3] * 0.3 + b[i * 3 + 1] * 0.59 + b[i * 3 + 2] * 0.11;
  const score = (dx, dy) => { let e = 0, n = 0; for (let Y = 16; Y < H2 - 16; Y += 2) for (let X = 16; X < W2 - 16; X += 2) { e += Math.abs(grey(frame(0), (Y + dy) * W2 + X + dx) - grey(big, Y * W2 + X)); n++; } return e / n; };
  let drift = [score(0, 0), 0, 0];
  for (let dy = -8; dy <= 8; dy++) for (let dx = -8; dx <= 8; dx++) { const e = score(dx, dy); if (e < drift[0]) drift = [e, dx, dy]; }
  const [, ddx, ddy] = drift;
  console.error(`take ${path.basename(take)}: drift ${ddx},${ddy} (2× px), frame-0 diff ${drift[0].toFixed(2)} (unshifted ${score(0, 0).toFixed(2)})`);
  const at2 = (f, X, Y, c) => frame(f)[(clamp(Y + ddy, 0, H2 - 1) * W2 + clamp(X + ddx, 0, W2 - 1)) * 3 + c];

  // per-pixel constants at 2×
  const rad = new Float32Array(N2), stillF = new Float32Array(N2), one = [0];
  for (let Y = 0; Y < H2; Y++) for (let X = 0; X < W2; X++) {
    const x = (X + 0.5) / SCALE, y = (Y + 0.5) / SCALE;
    rad[Y * W2 + X] = Math.hypot(x - CX, (y - CY) / S);
    stillF[Y * W2 + X] = bilinear(F, W, H, 1, x - 0.5, y - 0.5, one)[0];
  }
  const RING = RX + 26; // the knob's tick ring
  const blur2 = (src, r) => { // box blur on a 2× float image
    const t = new Float32Array(N2), o = new Float32Array(N2);
    for (let Y = 0; Y < H2; Y++) { let acc = 0; for (let X = -r; X < W2 + r; X++) { if (X + r < W2) acc += src[Y * W2 + Math.max(0, X + r)]; if (X - r - 1 >= 0) acc -= src[Y * W2 + X - r - 1]; if (X >= 0 && X < W2) t[Y * W2 + X] = acc / (2 * r + 1); } }
    for (let X = 0; X < W2; X++) { let acc = 0; for (let Y = -r; Y < H2 + r; Y++) { if (Y + r < H2) acc += t[Math.max(0, Y + r) * W2 + X]; if (Y - r - 1 >= 0) acc -= t[(Y - r - 1) * W2 + X]; if (Y >= 0 && Y < H2) o[Y * W2 + X] = acc / (2 * r + 1); } }
    return o;
  };
  const grow2 = (src, r) => { // max filter on a 2× float image
    const t = new Float32Array(N2), o = new Float32Array(N2);
    for (let Y = 0; Y < H2; Y++) for (let X = 0; X < W2; X++) { let m = 0; for (let k = Math.max(0, X - r); k <= Math.min(W2 - 1, X + r); k++) m = Math.max(m, src[Y * W2 + k]); t[Y * W2 + X] = m; }
    for (let X = 0; X < W2; X++) for (let Y = 0; Y < H2; Y++) { let m = 0; for (let k = Math.max(0, Y - r); k <= Math.min(H2 - 1, Y + r); k++) m = Math.max(m, t[k * W2 + X]); o[Y * W2 + X] = m; }
    return o;
  };
  const stillBlur = [0, 1, 2].map((c) => blur2(Float32Array.from({ length: N2 }, (_, i) => big[i * 3 + c]), 1));
  const out = [];
  for (let f = 0; f < FRAMES; f++) {
    const V = new Float32Array(N2 * 3);
    for (let Y = 0; Y < H2; Y++) for (let X = 0; X < W2; X++) for (let c = 0; c < 3; c++) {
      let acc = 0, n = 0; // 3-frame mean (looping), so codec noise doesn't toggle the lock
      for (const g of [f - 1, f, f + 1]) { acc += at2((g + FRAMES) % FRAMES, X, Y, c); n++; }
      V[(Y * W2 + X) * 3 + c] = acc / n;
    }
    const L = new Float32Array(N2);
    const VB = [0, 1, 2].map((c) => blur2(Float32Array.from({ length: N2 }, (_, i) => V[i * 3 + c]), 1));
    for (let i = 0; i < N2; i++) {
      if (rad[i] > 200) continue; // the halftone and the ground always come from the still
      let d = 0; for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(VB[c][i] - stillBlur[c][i]));
      L[i] = smooth(8, 24, d) * (1 - smooth(160, 200, rad[i]));
    }
    const LW = blur2(grow2(L, 14), 6);
    const buf = Buffer.alloc(N2 * 4);
    for (let Y = 0; Y < H2; Y++) for (let X = 0; X < W2; X++) {
      const i = Y * W2 + X, o = i * 4;
      const cur = [0, 1, 2].map((c) => at2(f, X, Y, c));
      // marble key on the take (stricter on the face, where the brushed metal reaches R−B 19)
      const rb = cur[0] - cur[2], onFace = rad[i] < RX + 2;
      const marble = smooth(onFace ? 19 : 12, onFace ? 27 : 22, rb);
      // near the knob, the take's background is replaced by the plate
      const near = 1 - smooth(RING - 4, RING + 4, rad[i]), keep = near ? marble + (1 - marble) * (1 - near) : 1;
      const lw = clamp(LW[i]);
      for (let c = 0; c < 3; c++) {
        const v = keep * cur[c] + (1 - keep) * plate2[i * 3 + c];
        buf[o + c] = Math.round(clamp(lw * v + (1 - lw) * big[i * 3 + c], 0, 255));
      }
      const finger = lw * marble + (1 - lw) * stillF[i];
      buf[o + 3] = Math.round(255 * (1 - cover[i] * (1 - finger)));
    }
    out.push(buf);
  }
  return out;
}

const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "roman-knob-hand-"));
const rawFile = path.join(tmp, "frames.rgba");
const fd = await fs.open(rawFile, "w");
const frames = []; // RGBA buffers at 2×, kept for the track and QA (96 × 1.8 MB)
const px = [0, 0, 0, 0];
if (TAKE) {
  for (const out of await veoFrames(TAKE)) {
    await fd.write(out);
    frames.push(out);
  }
} else {
  for (let f = 0; f < FRAMES; f++) {
    const { angle, lift } = pose(f / FPS);
    const out = Buffer.alloc(N2 * 4);
    for (let Y = 0; Y < H2; Y++) for (let X = 0; X < W2; X++) {
      const x = (X + 0.5) / SCALE, y = (Y + 0.5) / SCALE; // strip px (pixel centre)
      const u = x - CX, v = (y - CY) / S, r = Math.hypot(u, v);
      const w = falloff(r);
      let sx = x, sy = y;
      if (w > 0.0005) {
        // inverse map: the hand point turned back by the local twist and pulled back in by the lift
        const a = Math.atan2(v, u) - (angle * w * Math.PI) / 180, rr = Math.max(0, r - lift * w);
        sx = CX + rr * Math.cos(a); sy = CY + rr * Math.sin(a) * S;
      }
      bilinear(hand2, W2, H2, 4, sx * SCALE - 0.5, sy * SCALE - 0.5, px);
      const o = (Y * W2 + X) * 4, k = 1 - clamp(px[3] / 255);
      for (let c = 0; c < 3; c++) out[o + c] = Math.round(clamp(px[c] + plate2[(Y * W2 + X) * 3 + c] * k, 0, 255));
      // opaque except the window over the face where no finger covers it
      out[o + 3] = Math.round(255 * (1 - cover[Y * W2 + X] * k));
    }
    await fd.write(out);
    frames.push(out);
  }
}
await fd.close();

// ---- sync track: the index fingertip's contact angle, measured on the rendered frames ----
// Skin (soft R−B key) in a band on the rim, in the upper sector where the index finger grips (-160° to -20°), as an
// angular profile; each frame's profile is registered against frame 0's (best shift, 0.02° steps), which is the
// fingertip's turn so far. Angles are in the knob's un-squashed plane (the page turns the face as
// scaleY(s) rotate() scaleY(1/s)), clockwise positive.
const BIN = 0.25, BINS = 360 / BIN;
const SECTOR = TAKE ? [-170, 60] : [-160, -20]; // the index finger's range (the thumb stays below +100°)
const RANGE = TAKE ? [-20, 70] : [-5, TWIST + 10];
function profile(buf) {
  const p = new Float64Array(BINS);
  for (let Y = 0; Y < H2; Y++) for (let X = 0; X < W2; X++) {
    const u = (X + 0.5) / SCALE - CX, v = ((Y + 0.5) / SCALE - CY) / S, r = Math.hypot(u, v);
    if (r < RX - 12 || r > RX + 3) continue;
    const deg = (Math.atan2(v, u) * 180) / Math.PI;
    if (deg < SECTOR[0] || deg > SECTOR[1]) continue; // the index finger only, not the thumb
    // marble: R−B ≥ 26 for 75 % of the still's fingertip pixels here; the metal and the ring stay under 19 for 95 %
    const o = (Y * W2 + X) * 4, k = smooth(18, 30, buf[o] - buf[o + 2]);
    if (k > 0) p[Math.min(BINS - 1, Math.floor((deg + 180) / BIN))] += k;
  }
  // Gaussian, σ 1.5°: the raw bins carry the pixel grid's own pattern, which would pin the match at a zero shift.
  const g = Array.from({ length: 25 }, (_, k) => Math.exp(-(((k - 12) * BIN) ** 2) / (2 * 1.5 ** 2)));
  const sum = g.reduce((a, b) => a + b);
  return p.map((_, b) => g.reduce((acc, gk, k) => acc + gk * (p[b + k - 12] ?? 0), 0) / sum);
}
const at = (p, b) => { const i = Math.floor(b), f = b - i; return i < 0 || i >= BINS - 1 ? 0 : p[i] * (1 - f) + p[i + 1] * f; };
function shift(ref, next) {
  let best = [Infinity, 0];
  for (let d = RANGE[0]; d <= RANGE[1]; d += TAKE ? 0.05 : 0.02) {
    let e = 0;
    for (let b = 0; b < BINS; b++) e += (at(next, b + d / BIN) - ref[b]) ** 2;
    if (e < best[0]) best = [e, d];
  }
  return best[1];
}
const profiles = frames.map(profile);
const measured = profiles.map((p) => shift(profiles[0], p)); // fingertip turn since frame 0
// a real hand jitters: 5-frame (looping) mean before stepping the knob
const contact = TAKE ? measured.map((_, f) => [-2, -1, 0, 1, 2].reduce((a, k) => a + measured[(f + k + FRAMES) % FRAMES], 0) / 5) : measured;
const angles = [0];
for (let f = 1; f < FRAMES; f++) {
  const d = contact[f] - contact[f - 1];
  angles.push(+(angles[f - 1] + (d > (TAKE ? 0.15 : 0.05) ? d : 0)).toFixed(3)); // turning clockwise: the knob follows; else it holds
}

// ---- encode (same codecs and settings as roman-v2-motion-encode.mjs) ----
const run = (args) => execFileSync(FFMPEG, ["-v", "error", "-y", ...args], { maxBuffer: 1 << 30 });
const input = ["-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W2}x${H2}`, "-r", String(FPS), "-i", rawFile];
await fs.mkdir(OUT, { recursive: true });
const webm = path.join(OUT, `${ID}.webm`), mp4 = path.join(OUT, `${ID}.mp4`);
let crf, q;
for (crf of [30, 33, 36, 39, 42, 45]) {
  run([...input, "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-crf", String(crf), "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-g", String(FRAMES), "-an", webm]);
  if ((await fs.stat(webm)).size <= BUDGET) break;
  crf = null;
}
for (q of [[50, 0.75], [40, 0.75], [40, 0.65], [36, 0.55], [32, 0.5]]) {
  run([...input, "-c:v", "hevc_videotoolbox", "-pix_fmt", "bgra", "-alpha_quality", String(q[1]), "-q:v", String(q[0]), "-g", String(FRAMES), "-tag:v", "hvc1", "-movflags", "+faststart", "-an", mp4]);
  if ((await fs.stat(mp4)).size <= BUDGET) break;
  q = null;
}
if (crf == null || q == null) throw new Error(`BUDGET: ${ID} exceeds ${BUDGET / KB} KB`);

// Decode check: alpha present, frame count, seam (first↔last RGBA mean abs diff), match of frame 0 to the strip.
function decoded(file, kind) {
  const raw = execFileSync(FFMPEG, ["-v", "error", ...(kind === "webm" ? ["-c:v", "libvpx-vp9"] : []), "-i", file, "-f", "rawvideo", "-pix_fmt", "rgba", "-"], { maxBuffer: 1 << 30 });
  const n = N2 * 4, count = Math.floor(raw.length / n), fr = (k) => raw.subarray(k * n, (k + 1) * n);
  let seam = 0, alphaMin = 255;
  for (let i = 0; i < n; i++) seam += Math.abs(fr(0)[i] - fr(count - 1)[i]);
  for (let i = 3; i < n; i += 4) alphaMin = Math.min(alphaMin, fr(0)[i]);
  let still = 0, m = 0; // frame 0 vs the 2× strip, where opaque
  for (let i = 0; i < N2; i++) if (fr(0)[i * 4 + 3] === 255) { for (let c = 0; c < 3; c++) still += Math.abs(fr(0)[i * 4 + c] - big[i * 3 + c]); m += 3; }
  const probe = JSON.parse(execFileSync(FFPROBE, ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name,pix_fmt:stream_tags=alpha_mode", "-of", "json", file]).toString()).streams[0];
  return { bytes: 0, frames: count, alpha: alphaMin < 250, seam: +(seam / n).toFixed(2), frame0VsStrip: +(still / m).toFixed(2), probe, raw, fr };
}
const dec = { webm: decoded(webm, "webm"), mp4: decoded(mp4, "mp4") };
for (const [k, file] of [["webm", webm], ["mp4", mp4]]) dec[k].bytes = (await fs.stat(file)).size;

// ---- QA: page composite (face turned to the track angle + highlight, under the decoded video) ----
const manifestFile = path.join(root, "src/lib/roman-v2/motion.json");
const manifest = JSON.parse(await fs.readFile(manifestFile, "utf8"));
const layer = async (url) => sharp(path.join(root, "public", url)).resize(W2, H2, { kernel: "lanczos3" }).ensureAlpha().raw().toBuffer();
const face = await layer(manifest.knob.face), highlight = await layer(manifest.knob.highlight);
function turned(buf, deg) {
  const out = Buffer.alloc(N2 * 4), c = Math.cos((deg * Math.PI) / 180), s = Math.sin((deg * Math.PI) / 180), px4 = [0, 0, 0, 0];
  for (let Y = 0; Y < H2; Y++) for (let X = 0; X < W2; X++) {
    const pxx = (X + 0.5) / SCALE - CX, py = ((Y + 0.5) / SCALE - CY) / S;
    if (pxx * pxx + py * py > (RX + 2) ** 2) continue;
    const sx = c * pxx + s * py + CX, sy = (-s * pxx + c * py) * S + CY;
    bilinear(buf, W2, H2, 4, sx * SCALE - 0.5, sy * SCALE - 0.5, px4);
    const o = (Y * W2 + X) * 4;
    for (let k = 0; k < 4; k++) out[o + k] = Math.round(px4[k]);
  }
  return out;
}
await fs.mkdir(QA, { recursive: true });
const raw = { raw: { width: W2, height: H2, channels: 4 } };
const sheet = [];
const picks = Array.from({ length: 8 }, (_, k) => Math.round((k * FRAMES) / 8));
for (const f of picks) {
  const comp = await sharp(big, { raw: { width: W2, height: H2, channels: 3 } }).ensureAlpha()
    .composite([turned(face, angles[f]), highlight, Buffer.from(dec.webm.fr(f))].map((input) => ({ input, raw: raw.raw }))).removeAlpha().png().toBuffer();
  // 2× strip px 760–1072 × 0–300 (knob, fingers, knuckles), labelled
  const crop = await sharp(comp).extract({ left: 700, top: 0, width: 372, height: 300 }).png().toBuffer();
  const label = Buffer.from(`<svg width="372" height="300"><rect width="150" height="22" fill="#000a"/><text x="6" y="16" font-family="Helvetica" font-size="14" fill="#fff">${(f / FPS).toFixed(2)}s knob ${angles[f].toFixed(1)}°</text></svg>`);
  sheet.push(await sharp(crop).composite([{ input: label }]).png().toBuffer());
  if (f === 0) await sharp(comp).toFile(path.join(QA, `${QA_PREFIX}-composite-0.png`));
}
await sharp({ create: { width: 372 * 4, height: 300 * 2, channels: 3, background: "#000" } })
  .composite(sheet.map((input, k) => ({ input, left: (k % 4) * 372, top: Math.floor(k / 4) * 300 }))).png().toFile(path.join(QA, `${QA_PREFIX}-sheet.png`));
// alpha of a mid-twist frame (the window over the face, fingertips opaque)
const mid = picks[3];
const alpha = Buffer.alloc(N2);
for (let i = 0; i < N2; i++) alpha[i] = dec.webm.fr(mid)[i * 4 + 3];
await sharp(alpha, { raw: { width: W2, height: H2, channels: 1 } }).extract({ left: 760, top: 40, width: 260, height: 260 }).resize(520, 520, { kernel: "nearest" }).png().toFile(path.join(QA, `${QA_PREFIX}-alpha.png`));
await fs.rm(tmp, { recursive: true, force: true });

// ---- manifest ----
manifest.knob.track = { fps: FPS, angles };
const source = (file, type, bytes) => ({ src: `/${path.relative(path.join(root, "public"), file)}`, type, bytes });
manifest.clips[ID] = {
  id: ID, section: "beyond", role: "loop", device: "desktop", width: W2, height: H2, duration: SECONDS, fps: FPS,
  alpha: dec.webm.alpha && dec.mp4.alpha,
  sources: [source(webm, 'video/webm; codecs="vp09.00.10.08"', dec.webm.bytes), source(mp4, 'video/mp4; codecs="hvc1"', dec.mp4.bytes)],
  poster: "/roman-v2/beyond/beyond-music-536.webp",
};
await fs.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);

const summary = {
  id: ID, size: [W2, H2], frames: FRAMES, crf, q,
  webm: { bytes: dec.webm.bytes, frames: dec.webm.frames, alpha: dec.webm.alpha, seam: dec.webm.seam, frame0VsStrip: dec.webm.frame0VsStrip, probe: dec.webm.probe },
  mp4: { bytes: dec.mp4.bytes, frames: dec.mp4.frames, alpha: dec.mp4.alpha, seam: dec.mp4.seam, frame0VsStrip: dec.mp4.frame0VsStrip, probe: dec.mp4.probe },
  source: TAKE ? path.relative(root, TAKE) : `2d twist ${TWIST}°`,
  track: { perLoop: angles.at(-1), fingertipMax: Math.max(...contact), fingertipLast: contact.at(-1) },
};
const qaFile = path.join(root, "design/roman-v2/motion/encode-results.json");
const results = JSON.parse(await fs.readFile(qaFile, "utf8").catch(() => "{}"));
results[ID] = { ...summary, encodedAt: new Date().toISOString() };
await fs.writeFile(qaFile, `${JSON.stringify(results, null, 1)}\n`);
console.log(JSON.stringify(summary, null, 1));
