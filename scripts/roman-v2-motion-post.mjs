// Roman v2 motion post: locked-background cinemagraph + page crop + review sequences.
//
// Lock a clip (only the moving region plays; everything else is a still plate, so the
// background and halftone never flicker):
//   node scripts/roman-v2-motion-post.mjs --in clip.mp4 [--plate first|<png>] [--mask auto|<png>] [--crop [x,y,w,h]] --out out.mp4
//     --plate first   the clip's own first frame (default) or any PNG (scaled to the clip size)
//     --mask auto     motion map → mask (default; saved next to --out as <out>.mask.png) or a PNG
//     --crop          crop back to page aspect with the clip's cropToPage from shots.json
//                     (clip id = file name minus -tN), or explicit normalized x,y,w,h
//     --threshold N   motion threshold on the ×4 map (default 60); raise it if noise leaks into the mask
// Build a review sequence (clips must share a size; ":rev" reverses, "xN" repeats):
//   node scripts/roman-v2-motion-post.mjs --sequence intro.mp4,loop.mp4x3 --out seq.mp4
//   node scripts/roman-v2-motion-post.mjs --sequence a.mp4,b.mp4,b.mp4:rev,a.mp4:rev --out seq.mp4
// Every run prints the first↔last frame mean abs difference (0–255) of the output (seam check for loops).
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const FFMPEG = "/opt/homebrew/bin/ffmpeg";
const FFPROBE = "/opt/homebrew/bin/ffprobe";
const motionDir = path.join(process.cwd(), "design/roman-v2/motion");

const argv = process.argv.slice(2);
const arg = (name) => {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const next = argv[i + 1];
  return next === undefined || next.startsWith("--") ? true : next;
};
const out = arg("out");
if (typeof out !== "string") throw new Error("Pass --out <file.mp4>");

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { maxBuffer: 1 << 30, ...opts });
const ffmpeg = (args) => run(FFMPEG, ["-v", "error", "-y", ...args]);
const encode = ["-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an"];

function probe(file) {
  const [w, h, fps, frames] = run(FFPROBE, ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=width,height,nb_read_frames,r_frame_rate", "-of", "csv=p=0", file])
    .toString()
    .trim()
    .split(",");
  return { w: Number(w), h: Number(h), fps, frames: Number(frames) };
}

// Grey frames of a video as Buffers (w*h bytes each).
function greyFrames(file, { w, h }, filter = "null") {
  const raw = run(FFMPEG, ["-v", "error", "-i", file, "-vf", `${filter},format=gray`, "-f", "rawvideo", "-"]);
  const size = w * h;
  return Array.from({ length: Math.floor(raw.length / size) }, (_, i) => raw.subarray(i * size, (i + 1) * size));
}

function seamDiff(file) {
  const info = probe(file);
  const frames = greyFrames(file, info);
  const a = frames[0];
  const b = frames.at(-1);
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

async function autoMask(file, info, threshold) {
  // 1. motion map: per-pixel max |frame − first frame| at 6 fps, ×4
  const frames = greyFrames(file, info, "fps=6");
  const map = Buffer.alloc(info.w * info.h);
  for (const f of frames.slice(1))
    for (let i = 0; i < map.length; i++) {
      const d = Math.min(255, Math.abs(f[i] - frames[0][i]) * 4);
      if (d > map[i]) map[i] = d;
    }
  // 2. mask: blur(3) threshold(60) → dilate: blur(30) threshold(12) → feather: blur(16).
  // Each step is its own sharp pass (sharp collapses repeated blur()/threshold() in one chain).
  const raw = { raw: { width: info.w, height: info.h, channels: 1 } };
  const step = (buf, op) => op(sharp(buf, raw)).extractChannel(0).raw().toBuffer();
  let m = await step(map, (s) => s.blur(3));
  m = await step(m, (s) => s.threshold(threshold));
  m = await step(m, (s) => s.blur(30));
  m = await step(m, (s) => s.threshold(12));
  m = await step(m, (s) => s.blur(16));
  // saved as RGB: a gray mask turns the maskedmerge output greyscale
  const rgb = Buffer.alloc(m.length * 3);
  for (let i = 0; i < m.length; i++) rgb[3 * i] = rgb[3 * i + 1] = rgb[3 * i + 2] = m[i];
  const base = out.replace(/\.mp4$/, "");
  await sharp(map, raw).png().toFile(`${base}.motionmap.png`);
  await sharp(rgb, { raw: { width: info.w, height: info.h, channels: 3 } }).png().toFile(`${base}.mask.png`);
  const covered = m.reduce((n, v) => n + (v > 127), 0) / m.length;
  console.log(`mask: ${(covered * 100).toFixed(1)}% of the frame plays video`);
  return `${base}.mask.png`;
}

async function cropFilter(input) {
  const value = arg("crop");
  if (!value) return null;
  let rect;
  if (value === true || value === "auto") {
    const id = (arg("clip") ?? path.basename(input, ".mp4")).replace(/-t\d+$/, "");
    const shots = JSON.parse(await fs.readFile(path.join(motionDir, "shots.json"), "utf8"));
    rect = shots.shots.flatMap((s) => s.clips ?? []).find((c) => c.id === id)?.cropToPage;
    if (!rect) throw new Error(`No cropToPage for clip "${id}" — pass --clip <id> or --crop x,y,w,h`);
  } else rect = value.split(",").map(Number);
  const [x, y, w, h] = rect;
  return `crop=trunc(iw*${w}/2)*2:trunc(ih*${h}/2)*2:round(iw*${x}):round(ih*${y})`;
}

async function lock() {
  const input = arg("in");
  if (typeof input !== "string") throw new Error("Pass --in <clip.mp4>");
  const info = probe(input);
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "roman-post-"));
  try {
    const plateArg = arg("plate");
    let plate = typeof plateArg === "string" && plateArg !== "first" ? plateArg : path.join(tmp, "plate.png");
    if (plate.startsWith(tmp)) ffmpeg(["-i", input, "-frames:v", "1", plate]);
    const maskArg = arg("mask");
    const mask = typeof maskArg === "string" && maskArg !== "auto" ? maskArg : await autoMask(input, info, Number(arg("threshold") ?? 60));
    const crop = await cropFilter(input);
    // all three inputs must share gbrp, or the merge comes out greyscale
    const graph = [
      `[0:v]format=gbrp[v]`,
      `[1:v]scale=${info.w}:${info.h},format=gbrp[p]`,
      `[2:v]scale=${info.w}:${info.h},format=gbrp[m]`,
      `[p][v][m]maskedmerge${crop ? `,${crop}` : ""},format=yuv420p[o]`,
    ].join(";");
    // stills run at the clip's frame rate, or the merge resamples the clip's timing
    const still = ["-framerate", info.fps, "-loop", "1", "-i"];
    ffmpeg(["-i", input, ...still, plate, ...still, mask, "-filter_complex", graph, "-map", "[o]", "-frames:v", String(info.frames), ...encode, out]);
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
}

function sequence() {
  const parts = arg("sequence")
    .split(",")
    .flatMap((item) => {
      const m = item.match(/^(.*?)(?:x(\d+))?$/);
      const rev = m[1].endsWith(":rev");
      const file = rev ? m[1].slice(0, -4) : m[1];
      return Array.from({ length: Number(m[2] ?? 1) }, () => ({ file, rev }));
    });
  const graph =
    parts.map((p, i) => `[${i}:v]${p.rev ? "reverse," : ""}setpts=PTS-STARTPTS,setsar=1,format=yuv420p[s${i}]`).join(";") +
    `;${parts.map((_, i) => `[s${i}]`).join("")}concat=n=${parts.length}:v=1:a=0[o]`;
  ffmpeg([...parts.flatMap((p) => ["-i", p.file]), "-filter_complex", graph, "-map", "[o]", ...encode, out]);
}

await fs.mkdir(path.dirname(path.resolve(out)), { recursive: true });
if (arg("sequence")) sequence();
else await lock();
console.log(`${out}: ${probe(out).frames} frames, first↔last diff ${seamDiff(out).toFixed(2)}`);
