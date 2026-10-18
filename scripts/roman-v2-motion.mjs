// Roman v2 motion: generate video clips from design/roman-v2/motion/shots.json via OpenRouter.
//
// Run: node scripts/roman-v2-motion.mjs --tier draft --clips hero-intro-desktop,hero-loop-desktop [--takes 2] [--force]
// With --takes N, each clip is generated N times as <clip>-t1.mp4 … <clip>-tN.mp4
// (--take-offset K numbers them t(K+1) … t(K+N), for retries next to earlier takes).
// Reads OPENROUTER_API_KEY from .env.local (fallback .env). Writes
// design/roman-v2/motion/clips/<tier>/<clip>.mp4 + .json (status, usage) and appends to clips/cost-log.jsonl.
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const motionDir = path.join(root, "design/roman-v2/motion");
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
};
const tier = arg("tier") ?? "draft";
const wanted = (arg("clips") ?? "").split(",").filter(Boolean);
const force = process.argv.includes("--force");
const takes = Number(arg("takes") ?? 1);
const takeOffset = Number(arg("take-offset") ?? 0);
if (!wanted.length) throw new Error("Pass --clips id1,id2");

async function readEnv(file) {
  try {
    const text = await fs.readFile(path.join(root, file), "utf8");
    return Object.fromEntries(
      text
        .split("\n")
        .filter((line) => /^[A-Z0-9_]+=/.test(line))
        .map((line) => {
          const i = line.indexOf("=");
          return [line.slice(0, i), line.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
        })
    );
  } catch {
    return {};
  }
}
const key = (await readEnv(".env.local")).OPENROUTER_API_KEY || (await readEnv(".env")).OPENROUTER_API_KEY;
if (!key) throw new Error("OPENROUTER_API_KEY missing from .env.local / .env");
const headers = { authorization: `Bearer ${key}`, "content-type": "application/json" };

const shots = JSON.parse(await fs.readFile(path.join(motionDir, "shots.json"), "utf8"));
const clips = new Map(shots.shots.flatMap((shot) => (shot.clips ?? []).map((clip) => [clip.id, { shot, clip }])));
const price = shots.videoPricing ?? {};
const outDir = path.join(motionDir, "clips", tier);
await fs.mkdir(outDir, { recursive: true });

const dataUri = async (frameId) =>
  `data:image/png;base64,${(await fs.readFile(path.join(motionDir, "keyframes", `${frameId}.png`))).toString("base64")}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generate(id, take) {
  const entry = clips.get(id);
  if (!entry) throw new Error(`Unknown clip ${id}`);
  const { shot, clip } = entry;
  const name = takes > 1 || takeOffset ? `${id}-t${take + takeOffset}` : id;
  const out = path.join(outDir, `${name}.mp4`);
  if (!force && (await fs.stat(out).catch(() => null))) return console.log(`skip ${name} (exists)`);

  const model = clip.model[tier];
  const resolution = clip.resolution[tier];
  const frames = [{ type: "image_url", image_url: { url: await dataUri(clip.first) }, frame_type: "first_frame" }];
  if (clip.last) frames.push({ type: "image_url", image_url: { url: await dataUri(clip.last) }, frame_type: "last_frame" });
  const body = {
    model,
    prompt: clip.prompt,
    duration: clip.duration,
    resolution,
    aspect_ratio: clip.aspect_ratio ?? shot.aspect_ratio,
    generate_audio: false,
    frame_images: frames,
  };

  const submit = await fetch("https://openrouter.ai/api/v1/videos", { method: "POST", headers, body: JSON.stringify(body) });
  if (!submit.ok) throw new Error(`${id} submit ${submit.status}: ${(await submit.text()).slice(0, 400)}`);
  const job = await submit.json();
  console.log(`${name}: submitted (${model}, ${resolution}, ${clip.duration}s)`);

  const started = Date.now();
  let status;
  while (Date.now() - started < 25 * 60_000) {
    await sleep(15_000);
    status = await (await fetch(job.polling_url, { headers })).json();
    if (status.status === "completed") break;
    if (status.status === "failed") throw new Error(`${id} failed: ${JSON.stringify(status).slice(0, 400)}`);
  }
  if (status?.status !== "completed") throw new Error(`${id} timed out (${job.id})`);

  const video = await fetch(status.unsigned_urls[0], { headers });
  await fs.writeFile(out, Buffer.from(await video.arrayBuffer()));
  await fs.writeFile(path.join(outDir, `${name}.json`), JSON.stringify(status, null, 1));
  const tierName = model.includes("lite") ? "lite" : "fast";
  const estimate = (price[tierName]?.[resolution] ?? 0) * clip.duration;
  const log = { at: new Date().toISOString(), id: name, tier, model, resolution, duration: clip.duration, usage: status.usage ?? null, estimateUsd: estimate };
  await fs.appendFile(path.join(motionDir, "clips", "cost-log.jsonl"), `${JSON.stringify(log)}\n`);
  console.log(`${name}: saved ${path.relative(root, out)} (est. $${estimate.toFixed(2)})`);
}

const jobs = wanted.flatMap((id) => Array.from({ length: takes }, (_, i) => [id, i + 1]));
const results = await Promise.allSettled(jobs.map(([id, take]) => generate(id, take)));
results.forEach((result, i) => result.status === "rejected" && console.error(`${jobs[i].join(" take ")}: ${result.reason.message}`));
if (results.some((result) => result.status === "rejected")) process.exitCode = 1;
