// Roman v2 motion encode: approved takes → alpha video (WebM VP9 + HEVC) + src/lib/roman-v2/motion.json.
//
// Run: node scripts/roman-v2-motion-encode.mjs                 (every clip in CLIPS, 3 in parallel)
//      node scripts/roman-v2-motion-encode.mjs --only hero-intro-desktop,hero-loop-desktop
//
// Per clip:
//  1. Decode the raw Veo take, crop it to the region of the transparent still it replaces (the still's
//     master crop inside the keyframe canvas, shifted by the take's measured ±px drift against the
//     keyframe) and scale to the target size.
//  2. Locked background: plate = the clip's first keyframe (pixel-identical to the master), mask = the
//     take's motion mask from roman-v2-motion-post.mjs (or a hand-drawn one). Video only plays inside the mask.
//  3. Alpha: the plate is keyed with the exact still method (scripts/prepare-roman-v2-assets.mjs: fitted
//     ground plane, border flood, enclosed halftone holes, edge un-mix, same edge fades) at master
//     resolution and resized, so static areas match the still. Each frame (plate + video inside the
//     mask) is keyed with the same method
//     at target resolution; the two are blended through the mask.
//  4. Encode WebM VP9 (yuva420p) and HEVC with alpha (hevc_videotoolbox, hvc1), no audio, stepping the
//     quality down until the byte budget fits; fail loudly if it never does.
// Output: public/roman-v2/motion/<section>/<id>.{webm,mp4}; QA composites in design/roman-v2/motion/encode-qa/.
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs/promises";
import { openSync, readSync, writeSync, closeSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const FFMPEG = "/opt/homebrew/bin/ffmpeg";
const FFPROBE = "/opt/homebrew/bin/ffprobe";
const root = process.cwd();
const motionDir = path.join(root, "design/roman-v2/motion");
const draft = (f) => `design/roman-v2/motion/clips/draft/${f}`;
const final = (f) => `design/roman-v2/motion/clips/final/${f}`;
const postMask = (take) => path.join(path.dirname(take), "post", `${path.basename(take, ".mp4")}.mask.png`);
const KB = 1024;

// Stills the clips replace (mirrors scripts/prepare-roman-v2-assets.mjs). crop = master px; fade = master px.
const STILLS = {
  "hero-figure": { master: "hero-figure", crop: [0, 0, 1536, 1024], fade: { left: 110, top: 70, right: 30 }, matte: { lo: 3, hi: 7 }, bg: "#f4ebdf" },
  "hero-hands-mobile": { master: "hero-figure-mobile", crop: [0, 640, 780, 614], fade: { top: 60 }, matte: { lo: 3, hi: 7 }, bg: "#f4ebdf" },
  "career-hands": { master: "career-hands", crop: [600, 90, 1072, 790], fade: { left: 140, top: 90, right: 48 }, matte: { lo: 3, hi: 7 }, bg: "#f6efe5" },
  "projects-frame": { master: "projects-frame", crop: [0, 0, 1536, 1024], fade: { left: 70, top: 16, bottom: 16, right: 16 }, matte: { lo: 3, hi: 7 }, bg: "#b26e58" },
  "beyond-reading": { master: "beyond-reading", crop: [0, 0, 1536, 1024], fade: { left: 460, top: 10 }, matte: { lo: 3, hi: 7 }, bg: "#f2eae0" },
  "jj-listener": { master: "jj-listener", crop: [0, 0, 1536, 1024], fade: { left: 160, top: 40, right: 24 }, matte: { lo: 3, hi: 7 }, bg: "#4f1816" },
  "jj-listener-mobile": { master: "jj-listener-mobile", crop: [0, 0, 1122, 1402], fade: { left: 50, top: 40, right: 40 }, matte: { lo: 3, hi: 7 }, bg: "#4f1816" },
};

// Budgets in bytes per format. Hero intro+loop share one budget per device (checked as a group).
const BUDGET = {
  heroPair: { desktop: 900 * KB, mobile: 400 * KB },
  loop: { desktop: 500 * KB, mobile: 250 * KB },
  transition: { desktop: 300 * KB, mobile: 200 * KB },
};

// The approved takes. `parts` play in order (book A+B); plate = keyframe id the static areas come from.
// maxWidth caps the output width (desktop ≈ the still's largest export; mobile smaller).
const CLIPS = {
  "hero-intro-desktop": { section: "hero", role: "intro", device: "desktop", still: "hero-figure", maxWidth: 1536, parts: [{ take: draft("hero-intro-desktop.mp4"), plate: "hero-typing-desktop-master" }] },
  "hero-loop-desktop": { section: "hero", role: "loop", device: "desktop", still: "hero-figure", maxWidth: 1536, parts: [{ take: draft("hero-loop4-desktop-t2.mp4"), plate: "hero-typing-desktop-typing" }] },
  "hero-intro-mobile": { section: "hero", role: "intro", device: "mobile", still: "hero-hands-mobile", maxWidth: 780, parts: [{ take: draft("hero-intro-mobile-t1.mp4"), plate: "hero-typing-mobile-master" }] },
  "hero-loop-mobile": { section: "hero", role: "loop", device: "mobile", still: "hero-hands-mobile", maxWidth: 780, parts: [{ take: draft("hero-loop-mobile-t2.mp4"), plate: "hero-typing-mobile-typing" }] },
  "career-r43": { section: "career", role: "transition", device: "desktop", still: "career-hands", poster: "career-s4", reversePoster: "career-s3", maxWidth: 1072, reverse: "career-r43-rev", parts: [{ take: draft("career-r43-t3.mp4"), plate: "career-s4" }] },
  "career-r32": { section: "career", role: "transition", device: "desktop", still: "career-hands", poster: "career-s3", reversePoster: "career-s2", maxWidth: 1072, reverse: "career-r32-rev", parts: [{ take: draft("career-r32-t1.mp4"), plate: "career-s3" }] },
  "career-idle-s4": { section: "career", role: "idle", device: "desktop", still: "career-hands", poster: "career-s4", maxWidth: 1072, parts: [{ take: draft("career-idle-s4-t2.mp4"), plate: "career-s4" }] },
  "career-idle-s3": { section: "career", role: "idle", device: "desktop", still: "career-hands", poster: "career-s3", maxWidth: 1072, parts: [{ take: draft("career-idle-s3-t2.mp4"), plate: "career-s3" }] },
  "career-idle-s2": { section: "career", role: "idle", device: "desktop", still: "career-hands", poster: "career-s2", maxWidth: 1072, parts: [{ take: draft("career-idle-s2-t2.mp4"), plate: "career-s2" }] },
  "career-idle-s1": { section: "career", role: "idle", device: "desktop", still: "career-hands", poster: "career-s1", maxWidth: 1072, parts: [{ take: draft("career-idle-s1-t2.mp4"), plate: "career-s1" }] },
  "products-reader-loop": { section: "products", role: "loop", device: "desktop", still: "projects-frame", maxWidth: 1536, parts: [{ take: draft("products-reader-loop-t1.mp4"), plate: "products-reader-master", mask: "design/roman-v2/motion/clips/draft/post/masks/products-reader-eye.png" }] },
  "beyond-book-loop": { section: "beyond", role: "loop", device: "desktop", still: "beyond-reading", maxWidth: 1168, unionMask: true, parts: [{ take: draft("beyond-book-A-t4.mp4"), plate: "beyond-book-master" }, { take: draft("beyond-book-B-t3.mp4"), plate: "beyond-book-master" }] },
  "jj-listen-desktop": { section: "jj", role: "intro", device: "desktop", still: "jj-listener", maxWidth: 1536, parts: [{ take: draft("jj-listen-desktop-t1.mp4"), plate: "jj-desktop-start" }] },
  "jj-idle-desktop": { section: "jj", role: "idle", device: "desktop", still: "jj-listener", maxWidth: 1536, parts: [{ take: draft("jj-idle-desktop-t3.mp4"), plate: "jj-desktop-master" }] },
  "jj-listen-mobile": { section: "jj", role: "intro", device: "mobile", still: "jj-listener-mobile", maxWidth: 560, parts: [{ take: draft("jj-listen-mobile-t2.mp4"), plate: "jj-mobile-start" }] },
  "jj-idle-mobile": { section: "jj", role: "idle", device: "mobile", still: "jj-listener-mobile", maxWidth: 560, parts: [{ take: draft("jj-idle-mobile-t2.mp4"), plate: "jj-mobile-master" }] },
};

// Optional overrides written by later passes (accepted finals, r21) so this table stays the approved baseline.
const overridesFile = path.join(motionDir, "encode-overrides.json");
const overrides = JSON.parse(await fs.readFile(overridesFile, "utf8").catch(() => "{}"));
for (const [id, o] of Object.entries(overrides)) CLIPS[id] = { ...CLIPS[id], ...o };

const budgetFor = (c) =>
  c.section === "hero" ? BUDGET.heroPair[c.device] / 2 : c.role === "transition" ? BUDGET.transition[c.device] : BUDGET.loop[c.device];

// ---------- the still matte (port of prepare-roman-v2-assets.mjs, typed arrays, same rules) ----------
const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

// Least-squares plane per channel through ground samples (verbatim logic). Returns 3×3 coefficients.
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
    model = B.map((rhs) => {
      const M = A.map((row, r) => [...row, rhs[r]]);
      for (let c = 0; c < 3; c++) {
        let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
        [M[c], M[p]] = [M[p], M[c]];
        for (let r = 0; r < 3; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]; }
      }
      return M.map((row, r) => row[3] / row[r]);
    });
  }
  return model;
}
function groundPlane(model, w, h) {
  const G = new Float32Array(w * h * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const bx = x / w - 0.5, by = y / h - 0.5, i = (y * w + x) * 3;
    for (let ch = 0; ch < 3; ch++) G[i + ch] = model[ch][0] + model[ch][1] * bx + model[ch][2] * by;
  }
  return G;
}

function matte(rgb, alpha, w, h, { lo, hi, hole = 600, minHole = 6 }, G) {
  const N = w * h, d = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    let m = 0; for (let ch = 0; ch < 3; ch++) m = Math.max(m, Math.abs(rgb[i * 3 + ch] - G[i * 3 + ch]));
    d[i] = m;
  }
  const bg = new Uint8Array(N); // 1 ground, 2 in-progress hole, 3 visited (kept)
  const stack = new Int32Array(N);
  const flood = (sp) => {
    while (sp) {
      const i = stack[--sp], x = i % w, y = (i / w) | 0;
      if (x > 0 && !bg[i - 1] && d[i - 1] < hi) { bg[i - 1] = 1; stack[sp++] = i - 1; }
      if (x < w - 1 && !bg[i + 1] && d[i + 1] < hi) { bg[i + 1] = 1; stack[sp++] = i + 1; }
      if (y > 0 && !bg[i - w] && d[i - w] < hi) { bg[i - w] = 1; stack[sp++] = i - w; }
      if (y < h - 1 && !bg[i + w] && d[i + w] < hi) { bg[i + w] = 1; stack[sp++] = i + w; }
    }
  };
  const flatAround = (i) => { const x = i % w, y = (i / w) | 0; for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < w && Y < h && d[Y * w + X] >= lo) return false; } return true; };
  let sp = 0;
  const edges = [
    Array.from({ length: w }, (_, x) => x), Array.from({ length: w }, (_, x) => (h - 1) * w + x),
    Array.from({ length: h }, (_, y) => y * w), Array.from({ length: h }, (_, y) => y * w + w - 1),
  ];
  for (const edge of edges) {
    let run = [];
    for (const i of [...edge, -1]) {
      if (i >= 0 && d[i] < lo) { run.push(i); continue; }
      for (const j of run) if (run.length >= 24 || flatAround(j)) { bg[j] = 1; stack[sp++] = j; }
      run = [];
    }
  }
  flood(sp);
  const comp = new Int32Array(N);
  for (let s = 0; s < N; s++) {
    if (bg[s] || d[s] >= lo) continue;
    bg[s] = 2; let n = 0, q = 0; comp[n++] = s; stack[q++] = s;
    while (q) {
      const i = stack[--q], x = i % w, y = (i / w) | 0;
      const visit = (j) => { if (!bg[j] && d[j] < hi) { bg[j] = 2; comp[n++] = j; stack[q++] = j; } };
      if (x > 0) visit(i - 1); if (x < w - 1) visit(i + 1); if (y > 0) visit(i - w); if (y < h - 1) visit(i + w);
    }
    let ring = 0, rn = 0, sum = 0;
    for (let c = 0; c < n; c++) {
      const i = comp[c], x = i % w, y = (i / w) | 0; sum += d[i];
      if (x > 0 && bg[i - 1] !== 2) { ring += d[i - 1]; rn++; }
      if (x < w - 1 && bg[i + 1] !== 2) { ring += d[i + 1]; rn++; }
      if (y > 0 && bg[i - w] !== 2) { ring += d[i - w]; rn++; }
      if (y < h - 1 && bg[i + w] !== 2) { ring += d[i + w]; rn++; }
    }
    const flat = sum / n < lo && rn > 0 && ring / rn > hi * 3;
    const mark = n >= minHole && n <= hole && flat ? 1 : 3;
    for (let c = 0; c < n; c++) bg[comp[c]] = mark;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    let near = bg[i] === 1, dl = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
      const j = Y * w + X; if (bg[j] === 1) near = true; if (d[j] > dl) dl = d[j];
    }
    if (!near) continue;
    const k = dl >= hi * 1.5 ? Math.min(1, Math.max(0, (d[i] - lo) / (dl - lo))) : bg[i] === 1 ? smooth(lo, hi, d[i]) : 1;
    alpha[i] *= k;
    if (k > 0.02 && k < 1) for (let ch = 0; ch < 3; ch++) rgb[i * 3 + ch] = G[i * 3 + ch] + (rgb[i * 3 + ch] - G[i * 3 + ch]) / k;
    else if (k <= 0.02) for (let ch = 0; ch < 3; ch++) rgb[i * 3 + ch] = G[i * 3 + ch];
  }
}

// separable max filter / box blur on a single-channel float image (radius r)
function maxFilter1(src, w, h, r) {
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let m = 0; for (let k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k++) m = Math.max(m, src[y * w + k]); tmp[y * w + x] = m; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let m = 0; for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) m = Math.max(m, tmp[k * w + x]); out[y * w + x] = m; }
  return out;
}
function boxBlur1(src, w, h, r) {
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0, n = 0; for (let k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k++) { s += src[y * w + k]; n++; } tmp[y * w + x] = s / n; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0, n = 0; for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) { s += tmp[k * w + x]; n++; } out[y * w + x] = s / n; }
  return out;
}

function temporalMean(video, f, count, N) {
  const a = Math.max(0, f - 1), b = Math.min(count - 1, f + 1), out = new Float32Array(N * 3);
  for (let k = a; k <= b; k++) { const o = k * N * 3; for (let i = 0; i < N * 3; i++) out[i] += video[o + i]; }
  for (let i = 0; i < N * 3; i++) out[i] /= b - a + 1;
  return out;
}

// 3×3 box blur of an RGB buffer (Float32Array out).
function blur3(src, w, h) {
  const tmp = new Float32Array(w * h * 3), out = new Float32Array(w * h * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let ch = 0; ch < 3; ch++) {
    const i = (y * w + x) * 3 + ch, l = x > 0 ? i - 3 : i, r = x < w - 1 ? i + 3 : i;
    tmp[i] = (src[l] + src[i] + src[r]) / 3;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let ch = 0; ch < 3; ch++) {
    const i = (y * w + x) * 3 + ch, u = y > 0 ? i - w * 3 : i, d = y < h - 1 ? i + w * 3 : i;
    out[i] = (tmp[u] + tmp[i] + tmp[d]) / 3;
  }
  return out;
}

function fades(alpha, w, h, f, scale) {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let k = 1;
    if (f.left) k *= smooth(0, f.left * scale, x); if (f.right) k *= smooth(0, f.right * scale, w - 1 - x);
    if (f.top) k *= smooth(0, f.top * scale, y); if (f.bottom) k *= smooth(0, f.bottom * scale, h - 1 - y);
    alpha[y * w + x] *= k;
  }
}

// RGBA Buffer (straight alpha) from float rgb + alpha.
function toRGBA(rgb, alpha, n) {
  const buf = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    for (let ch = 0; ch < 3; ch++) buf[i * 4 + ch] = Math.max(0, Math.min(255, Math.round(rgb[i * 3 + ch])));
    buf[i * 4 + 3] = Math.round(Math.max(0, Math.min(1, alpha[i])) * 255);
  }
  return buf;
}

// The still, keyed exactly like prepare-roman-v2-assets.mjs, from any keyframe (canvas) → RGBA at w×h.
async function keyedStill(keyframeId, still, w, h) {
  const { content } = frameRect(keyframeId);
  const [cx, cy, cw, ch] = still.crop;
  const { data, info } = await sharp(path.join(motionDir, "keyframes", `${keyframeId}.png`))
    .removeAlpha().extract({ left: content[0] + cx, top: content[1] + cy, width: cw, height: ch }).raw().toBuffer({ resolveWithObject: true });
  const rgb = new Float32Array(data), alpha = new Float32Array(info.width * info.height).fill(1);
  const model = fitGround(rgb, info.width, info.height);
  matte(rgb, alpha, info.width, info.height, still.matte, groundPlane(model, info.width, info.height));
  fades(alpha, info.width, info.height, still.fade, 1);
  const full = toRGBA(rgb, alpha, info.width * info.height);
  const raw = { raw: { width: info.width, height: info.height, channels: 4 } };
  return { full, raw, small: w ? await sharp(full, raw).resize(w, h, { fit: "fill" }).raw().toBuffer() : null };
}

// ---------- geometry ----------
const shots = JSON.parse(await fs.readFile(path.join(motionDir, "shots.json"), "utf8"));
const frameRect = (id) => {
  const f = shots.frames.find((x) => x.id === id);
  if (!f?.canvasRect) throw new Error(`No canvasRect for keyframe ${id}`);
  return f.canvasRect;
};
const even = (n) => Math.max(2, Math.round(n / 2) * 2);

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { maxBuffer: 1 << 30, ...opts });
function probe(file) {
  const [w, h, fps, frames] = run(FFPROBE, ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=width,height,r_frame_rate,nb_read_frames", "-of", "csv=p=0", file]).toString().trim().split(",");
  return { w: Number(w), h: Number(h), fps, frames: Number(frames) };
}

// Integer drift of the take's first frame against the plate keyframe (grey, clip resolution).
async function drift(take, info, plateId) {
  const f = run(FFMPEG, ["-v", "error", "-i", take, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "gray", "-"]);
  const k = await sharp(path.join(motionDir, "keyframes", `${plateId}.png`)).resize(info.w, info.h, { fit: "fill" }).grayscale().raw().toBuffer();
  const { w, h } = info;
  const score = (dx, dy) => { let s = 0, n = 0; for (let y = 8; y < h - 8; y += 2) for (let x = 8; x < w - 8; x += 2) { s += Math.abs(f[y * w + x] - k[(y + dy) * w + x + dx]); n++; } return s / n; };
  let best = [score(0, 0), 0, 0];
  const zero = best[0];
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const s = score(dx, dy); if (s < best[0]) best = [s, dx, dy]; }
  return best[0] < zero * 0.95 ? { dx: best[1], dy: best[2], before: zero, after: best[0] } : { dx: 0, dy: 0, before: zero, after: zero };
}

// ---------- one clip ----------
async function encodeClip(id) {
  const c = CLIPS[id];
  const still = STILLS[c.still];
  const first = c.parts[0];
  const info = probe(first.take);
  const plateRect = frameRect(first.plate);
  const [CW, CH] = plateRect.canvas;
  const [ox, oy] = plateRect.content;
  const [sx, sy, sw, sh] = still.crop;
  // still region in clip pixels
  const rx = ((ox + sx) / CW) * info.w, ry = ((oy + sy) / CH) * info.h, rw = (sw / CW) * info.w, rh = (sh / CH) * info.h;
  const W = even(Math.min(c.maxWidth, rw, sw)), H = even((W * sh) / sw);
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), `roman-enc-${id}-`));
  const log = { id, parts: [], size: [W, H] };
  try {
    const plateKeyed = (await keyedStill(first.plate, still, W, H)).small; // RGBA W×H, still method
    const plateRGB = await sharp(path.join(motionDir, "keyframes", `${first.plate}.png`)).removeAlpha()
      .extract({ left: ox + sx, top: oy + sy, width: sw, height: sh }).resize(W, H, { fit: "fill" }).raw().toBuffer();
    const N = W * H;
    const plateBlur = blur3(plateRGB, W, H);
    const model = fitGround(new Float32Array(plateRGB), W, H);
    const G = groundPlane(model, W, H);
    const scale = W / sw;
    const mopts = { ...still.matte, hole: Math.round(600 * scale * scale), minHole: Math.max(3, Math.round(6 * scale * scale)) };

    // per-part crops (with drift) and masks
    const parts = [];
    for (const p of c.parts) {
      const pi = probe(p.take);
      const dr = await drift(p.take, pi, p.plate);
      const cw = Math.round(rw), chh = Math.round(rh);
      const cx = Math.min(pi.w - cw, Math.max(0, Math.round(rx - dr.dx))), cy = Math.min(pi.h - chh, Math.max(0, Math.round(ry - dr.dy)));
      const crop = `crop=${cw}:${chh}:${cx}:${cy},scale=${W}:${H}:flags=lanczos`;
      const maskFile = p.mask ?? postMask(p.take);
      const mbuf = await sharp(maskFile).removeAlpha().extract({ left: cx, top: cy, width: cw, height: chh }).resize(W, H, { fit: "fill" }).extractChannel(0).raw().toBuffer();
      parts.push({ ...p, info: pi, crop, mask: mbuf, maskFile, drift: dr });
      log.parts.push({ take: p.take, plate: p.plate, mask: maskFile, frames: pi.frames, drift: [dr.dx, dr.dy], driftScore: [+dr.before.toFixed(2), +dr.after.toFixed(2)] });
    }
    if (c.unionMask) { const u = Buffer.alloc(N); for (const p of parts) for (let i = 0; i < N; i++) u[i] = Math.max(u[i], p.mask[i]); for (const p of parts) p.mask = u; }

    // frames → raw RGBA file
    const rawFile = path.join(tmp, "frames.rgba");
    const fd = openSync(rawFile, "w");
    let frames = 0;
    for (const p of parts) {
      const video = run(FFMPEG, ["-v", "error", "-i", p.take, "-vf", p.crop, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]);
      const count = Math.floor(video.length / (N * 3));
      const M0 = new Float32Array(N); for (let i = 0; i < N; i++) M0[i] = p.mask[i] / 255;
      const M = new Float32Array(N);
      for (let f = 0; f < count; f++) {
        const V = video.subarray(f * N * 3, (f + 1) * N * 3);
        // Per-pixel lock inside the mask: where the (3×3-blurred) video stays within codec noise of the plate,
        // keep the plate, so only real motion changes colour and alpha (no edge/halftone/hole flicker).
        // temporal 3-frame mean (within the part) so codec noise does not toggle the lock frame to frame
        const VB = blur3(temporalMean(video, f, count, N), W, H);
        const L = new Float32Array(N);
        for (let i = 0; i < N; i++) {
          if (M0[i] <= 0) continue;
          let dv = 0; for (let ch = 0; ch < 3; ch++) dv = Math.max(dv, Math.abs(VB[i * 3 + ch] - plateBlur[i * 3 + ch]));
          L[i] = smooth(LOCK[0], LOCK[1], dv);
        }
        // grow the lock region (a cream hand over cream ground only differs at the halftone squares) and feather it
        const LW = boxBlur1(maxFilter1(L, W, H, LOCK_GROW), W, H, LOCK_FEATHER);
        for (let i = 0; i < N; i++) M[i] = M0[i] * Math.min(1, LW[i]);
        const rgb = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
          const m = M[i];
          for (let ch = 0; ch < 3; ch++) rgb[i * 3 + ch] = m * V[i * 3 + ch] + (1 - m) * plateRGB[i * 3 + ch];
        }
        const alpha = new Float32Array(N).fill(1);
        matte(rgb, alpha, W, H, mopts, G);
        fades(alpha, W, H, still.fade, scale);
        const out = Buffer.alloc(N * 4);
        for (let i = 0; i < N; i++) {
          const m = M[i];
          const a1 = alpha[i], a2 = plateKeyed[i * 4 + 3] / 255;
          const a = m * a1 + (1 - m) * a2;
          for (let ch = 0; ch < 3; ch++) {
            const v = a > 0.0001 ? (m * a1 * rgb[i * 3 + ch] + (1 - m) * a2 * plateKeyed[i * 4 + ch]) / a : G[i * 3 + ch];
            out[i * 4 + ch] = Math.max(0, Math.min(255, Math.round(v)));
          }
          out[i * 4 + 3] = Math.round(a * 255);
        }
        writeSync(fd, out);
        frames++;
      }
    }
    closeSync(fd);
    if (process.env.ROMAN_KEEP_RAW) await fs.copyFile(rawFile, path.join(process.env.ROMAN_KEEP_RAW, `${id}-${W}x${H}.rgba`));
    const fps = 24;
    const outputs = [{ id, file: rawFile }];
    if (c.reverse) {
      const revFile = path.join(tmp, "frames-rev.rgba");
      const src = openSync(rawFile, "r"), dst = openSync(revFile, "w"), buf = Buffer.alloc(N * 4);
      for (let f = frames - 1; f >= 0; f--) { readSync(src, buf, 0, N * 4, f * N * 4); writeSync(dst, buf); }
      closeSync(src); closeSync(dst);
      outputs.push({ id: c.reverse, file: revFile });
    }
    const results = [];
    for (const o of outputs) results.push(await encodeOne(o.id, c, o.file, W, H, frames, fps, id !== o.id));
    log.results = results;
    return log;
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
}

// Lock ramp on the blurred video↔plate difference (0–255): below LOCK[0] = plate, above LOCK[1] = video.
const LOCK = (process.env.ROMAN_LOCK ?? "8,24").split(",").map(Number);
const LOCK_GROW = 14, LOCK_FEATHER = 6; // px at output size
const VP9_CRF = [30, 33, 36, 39, 42, 45, 48, 51, 54];
// VideoToolbox HEVC: frames are premultiplied first (Safari composites HEVC alpha as premultiplied, so straight
// colour under transparent pixels would add a white wash). [q:v, alpha_quality]. The alpha layer is the expensive part (≈+270 KB per 4 s at 1080×720
// going from 0.5 to 0.75), so alpha quality steps down from 0.75 only when the budget needs it.
const HEVC_Q = [[50, 0.75], [40, 0.75], [40, 0.65], [36, 0.55], [32, 0.5], [28, 0.45], [24, 0.4]];

async function encodeOne(id, c, rawFile, W, H, frames, fps, reversed) {
  const dir = path.join(root, "public/roman-v2/motion", c.section);
  await fs.mkdir(dir, { recursive: true });
  const input = ["-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W}x${H}`, "-r", String(fps), "-i", rawFile];
  const budget = budgetFor(c);
  const webm = path.join(dir, `${id}.webm`), mp4 = path.join(dir, `${id}.mp4`);
  let crf, q;
  for (crf of VP9_CRF) {
    run(FFMPEG, ["-v", "error", "-y", ...input, "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-crf", String(crf), "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-g", String(frames), "-an", webm]);
    if ((await fs.stat(webm)).size <= budget) break;
    crf = null;
  }
  if (crf == null) throw new Error(`BUDGET: ${id}.webm exceeds ${budget / KB} KB even at crf ${VP9_CRF.at(-1)}`);
  for (q of HEVC_Q) {
    run(FFMPEG, ["-v", "error", "-y", ...input, "-vf", "premultiply=inplace=1", "-c:v", "hevc_videotoolbox", "-pix_fmt", "bgra", "-alpha_quality", String(q[1]), "-q:v", String(q[0]), "-g", String(frames), "-tag:v", "hvc1", "-movflags", "+faststart", "-an", mp4]);
    if ((await fs.stat(mp4)).size <= budget) break;
    q = null;
  }
  if (q == null) throw new Error(`BUDGET: ${id}.mp4 exceeds ${budget / KB} KB even at q/alpha ${HEVC_Q.at(-1)}`);
  return { id, reversed, W, H, frames, fps, crf, q, webm: await qa(webm, "webm", W, H, c), mp4: await qa(mp4, "mp4", W, H, c) };
}

// Decode with alpha, check pix_fmt, seam (first↔last RGBA mean abs diff) and write QA composites.
async function qa(file, kind, W, H, c) {
  const bytes = (await fs.stat(file)).size;
  const pix = run(FFPROBE, ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=pix_fmt,codec_name:stream_tags=alpha_mode", "-of", "json", file]).toString();
  const dec = kind === "webm" ? ["-c:v", "libvpx-vp9"] : [];
  const raw = run(FFMPEG, ["-v", "error", ...dec, "-i", file, "-f", "rawvideo", "-pix_fmt", "rgba", "-"]);
  const n = W * H * 4, count = Math.floor(raw.length / n);
  const fr = (k) => raw.subarray(k * n, (k + 1) * n);
  let seam = 0; const a = fr(0), b = fr(count - 1);
  for (let i = 0; i < n; i++) seam += Math.abs(a[i] - b[i]);
  let alphaMin = 255; const mid = fr(count >> 1);
  for (let i = 3; i < n; i += 4) alphaMin = Math.min(alphaMin, mid[i]);
  const qaDir = path.join(motionDir, "encode-qa");
  await fs.mkdir(qaDir, { recursive: true });
  const base = path.join(qaDir, `${path.basename(file).replace(/\./, "-")}`);
  const rawIn = { raw: { width: W, height: H, channels: 4 } };
  const bgc = hexToRgb(STILLS[c.still].bg);
  await sharp(mid, rawIn).flatten({ background: { r: 255, g: 0, b: 255 } }).png().toFile(`${base}-magenta.png`);
  await sharp(mid, rawIn).flatten({ background: { r: bgc[0], g: bgc[1], b: bgc[2] } }).png().toFile(`${base}-section.png`);
  return { file: path.relative(root, file), bytes, frames: count, duration: count / 24, alpha: alphaMin < 250, probe: JSON.parse(pix).streams[0], seam: +(seam / n).toFixed(2) };
}

// ---------- career state stills (posters for S1–S3; S4 is the existing career-hands still) ----------
async function careerPosters() {
  const out = {};
  for (const s of ["career-s1", "career-s2", "career-s3"]) {
    const { full, raw } = await keyedStill(s, STILLS["career-hands"], 0, 0);
    const dir = path.join(root, "public/roman-v2/motion/career");
    await fs.mkdir(dir, { recursive: true });
    await sharp(full, raw).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(path.join(dir, `${s}-1072.webp`));
    await sharp(full, raw).avif({ quality: 44, effort: 6 }).toFile(path.join(dir, `${s}-1072.avif`));
    out[s] = `/roman-v2/motion/career/${s}-1072.webp`;
  }
  return out;
}

async function posterFor(c, W) {
  if (c.poster && c.poster !== "career-s4") return `/roman-v2/motion/career/${c.poster}-1072.webp`;
  const assets = JSON.parse(await fs.readFile(path.join(root, "design/roman-v2/assets/manifest.json"), "utf8")).assets;
  const files = assets.find((a) => a.id === c.still).files.filter((f) => f.format === "webp").sort((p, q) => p.width - q.width);
  return (files.find((f) => f.width >= W) ?? files.at(-1)).url;
}

// ---------- main ----------
const argv = process.argv.slice(2);
const argOf = (name) => { const i = argv.indexOf(`--${name}`); return i === -1 ? undefined : argv[i + 1]; };

if (argOf("one")) {
  const log = await encodeClip(argOf("one"));
  process.stdout.write(`@@RESULT ${JSON.stringify(log)}\n`);
} else {
  const ids = argOf("only")?.split(",") ?? Object.keys(CLIPS);
  for (const id of ids) if (!CLIPS[id]) throw new Error(`Unknown clip ${id}`);
  if (!argOf("only") || ids.some((id) => id.startsWith("career"))) await careerPosters();
  const logs = [];
  const queue = [...ids];
  const worker = async () => {
    while (queue.length) {
      const id = queue.shift();
      const started = Date.now();
      const text = await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [process.argv[1], "--one", id], { cwd: root, stdio: ["ignore", "pipe", "inherit"] });
        let s = ""; child.stdout.on("data", (b) => (s += b));
        child.on("exit", (code) => (code ? reject(new Error(`${id} failed (exit ${code})`)) : resolve(s)));
      });
      const log = JSON.parse(text.split("@@RESULT ")[1]);
      logs.push(log);
      console.log(`${id}: ${log.results.map((r) => `${r.id} webm ${(r.webm.bytes / KB).toFixed(0)}KB crf${r.crf} / mp4 ${(r.mp4.bytes / KB).toFixed(0)}KB q${r.q.join('/')}`).join("; ")} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
    }
  };
  const results = await Promise.allSettled(Array.from({ length: Number(argOf("jobs") ?? 3) }, worker));
  const failures = results.filter((r) => r.status === "rejected");

  // manifest (merge: keep other clips and extra keys such as "knob")
  const manifestFile = path.join(root, "src/lib/roman-v2/motion.json");
  const manifest = JSON.parse(await fs.readFile(manifestFile, "utf8").catch(() => '{"version":1,"clips":{}}'));
  manifest.version = 1;
  manifest.clips ??= {};
  for (const log of logs) {
    const c = CLIPS[log.id];
    for (const r of log.results) {
      const cc = r.reversed ? { ...c, role: "transition-reverse", poster: c.reversePoster } : c;
      manifest.clips[r.id] = {
        id: r.id, section: c.section, role: cc.role, device: c.device, width: r.W, height: r.H,
        duration: +(r.frames / r.fps).toFixed(3), fps: r.fps, alpha: r.webm.alpha && r.mp4.alpha,
        sources: [
          { src: `/${path.relative(path.join(root, "public"), path.join(root, r.webm.file))}`, type: 'video/webm; codecs="vp09.00.10.08"', bytes: r.webm.bytes },
          { src: `/${path.relative(path.join(root, "public"), path.join(root, r.mp4.file))}`, type: 'video/mp4; codecs="hvc1"', bytes: r.mp4.bytes },
        ],
        poster: await posterFor(cc, r.W),
      };
    }
  }
  const order = [...Object.keys(CLIPS).flatMap((id) => [id, CLIPS[id].reverse].filter(Boolean))];
  manifest.clips = Object.fromEntries(Object.entries(manifest.clips).sort(([a], [b]) => (order.indexOf(a) + 1 || 999) - (order.indexOf(b) + 1 || 999)));
  await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2) + "\n");

  // QA log
  const qaFile = path.join(motionDir, "encode-results.json");
  const prev = JSON.parse(await fs.readFile(qaFile, "utf8").catch(() => "{}"));
  for (const log of logs) prev[log.id] = { ...log, encodedAt: new Date().toISOString() };
  await fs.writeFile(qaFile, JSON.stringify(prev, null, 1) + "\n");

  // group budgets (hero intro+loop per device)
  const problems = failures.map((f) => f.reason.message);
  for (const device of ["desktop", "mobile"]) for (const fmt of [0, 1]) {
    const a = manifest.clips[`hero-intro-${device}`], b = manifest.clips[`hero-loop-${device}`];
    if (a && b && a.sources[fmt].bytes + b.sources[fmt].bytes > BUDGET.heroPair[device]) problems.push(`BUDGET: hero ${device} intro+loop ${fmt ? "mp4" : "webm"} ${((a.sources[fmt].bytes + b.sources[fmt].bytes) / KB).toFixed(0)} KB > ${BUDGET.heroPair[device] / KB} KB`);
  }
  if (problems.length) { console.error(problems.join("\n")); process.exitCode = 1; }
}
