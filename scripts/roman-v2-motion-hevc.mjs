// Rebuild every HEVC-with-alpha clip in public/roman-v2/motion from its VP9 WebM twin, premultiplying the colour by
// alpha first (Safari composites HEVC alpha as premultiplied). Keeps each file within its previous size (+15%),
// then updates the byte counts in src/lib/roman-v2/motion.json.
//
// Run: node scripts/roman-v2-motion-hevc.mjs
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const FFMPEG = "/opt/homebrew/bin/ffmpeg";
const root = process.cwd();
const manifestPath = path.join(root, "src/lib/roman-v2/motion.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
// Size baseline: the committed manifest (so re-runs don't ratchet the budget up).
const committed = JSON.parse(execFileSync("git", ["show", "HEAD:src/lib/roman-v2/motion.json"], { cwd: root }).toString());
const HEVC_Q = [[50, 0.75], [40, 0.75], [40, 0.65], [36, 0.55], [32, 0.5], [28, 0.45], [24, 0.4]];

for (const clip of Object.values(manifest.clips)) {
  const mp4 = clip.sources.find((source) => source.type.startsWith("video/mp4"));
  const webm = clip.sources.find((source) => source.type.startsWith("video/webm"));
  if (!clip.alpha || !mp4 || !webm) continue;
  const out = path.join(root, "public", mp4.src);
  const before = committed.clips[clip.id]?.sources.find((source) => source.type.startsWith("video/mp4"))?.bytes ?? mp4.bytes;
  const budget = Math.max(before * 1.15, 120 * 1024);
  let bytes;
  for (const [quality, alpha] of HEVC_Q) {
    execFileSync(FFMPEG, ["-v", "error", "-y", "-c:v", "libvpx-vp9", "-i", path.join(root, "public", webm.src),
      "-vf", "premultiply=inplace=1", "-c:v", "hevc_videotoolbox", "-pix_fmt", "bgra", "-alpha_quality", String(alpha),
      "-q:v", String(quality), "-g", "1000", "-tag:v", "hvc1", "-movflags", "+faststart", "-an", out]);
    bytes = (await fs.stat(out)).size;
    if (bytes <= budget) break;
  }
  console.log(`${clip.id}: ${(before / 1024).toFixed(1)} → ${(bytes / 1024).toFixed(1)} KB${bytes > budget ? "  OVER BUDGET" : ""}`);
  mp4.bytes = bytes;
}
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 1) + "\n");
