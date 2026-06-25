import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

loadDotEnv(resolve(root, ".env"));
loadDotEnv(resolve(root, ".env.local"));

const jiti = createJiti(import.meta.url, {
  moduleCache: false,
  tsconfigPaths: true,
});

const { runRetrievalEval } = await jiti.import("../src/lib/jj/evals/runRetrievalEval.ts");
const { perCase, aggregate } = await runRetrievalEval();

for (const result of perCase) {
  const status = result.passed ? "PASS" : "FAIL";
  console.log(`\n[${status}] ${result.caseId}`);
  console.log(`Query: ${result.query}`);
  console.log(`Vector@10: ${result.vectorChunkIds.join(", ") || "(none)"}`);
  console.log(`Selected: ${result.selectedChunkIds.join(", ") || "(none)"}`);
  console.log(`Rejected: ${result.rejectedChunkIds.join(", ") || "(none)"}`);
  if (result.expectedCommands.length > 0) {
    console.log(`Command match: ${result.commandMatches ? "yes" : "no"}`);
  }
  if (result.notes.length > 0) {
    console.log(`Notes: ${result.notes.join(" | ")}`);
  }
}

console.log("\nAggregate");
console.log(JSON.stringify(roundMetrics(aggregate), null, 2));

if (aggregate.passed !== aggregate.cases) {
  process.exitCode = 1;
}

function roundMetrics(metrics) {
  return Object.fromEntries(
    Object.entries(metrics).map(([key, value]) => [
      key,
      typeof value === "number" ? Number(value.toFixed(3)) : value,
    ])
  );
}

function loadDotEnv(path) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}
