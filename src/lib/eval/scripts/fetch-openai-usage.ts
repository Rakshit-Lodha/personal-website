import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { RunFile, TestSet } from "../types";

loadEnvConfig(process.cwd());

const TEST_SETS: TestSet[] = ["factual", "quality", "skeptic"];
const DEFAULT_VERSIONS = ["v1", "v2_prompt", "v3Pipeline_tightened"];
const CASE_DELAY_MS = 1500;
const WINDOW_PADDING_SECONDS = Number(process.env.OPENAI_USAGE_WINDOW_PADDING_SECONDS || 30);
const OUTPUT_PATH = path.join(process.cwd(), "src", "lib", "Eval", "summaries", "openai_usage_costs.json");

type UsageResult = {
  input_tokens?: number;
  input_cached_tokens?: number;
  output_tokens?: number;
  num_model_requests?: number;
  model?: string | null;
  project_id?: string | null;
  api_key_id?: string | null;
};

type UsageBucket = {
  start_time: number;
  end_time: number;
  results?: UsageResult[];
};

type UsageResponse = {
  data?: UsageBucket[];
  next_page?: string | null;
  error?: { message?: string };
};

type UsageTotals = {
  input_tokens: number;
  input_cached_tokens: number;
  output_tokens: number;
  num_model_requests: number;
  estimated_cost_usd: number | null;
};

type Price = {
  input: number;
  output: number;
  cachedInput?: number;
};

const DEFAULT_USD_PER_MILLION_TOKENS: Record<string, Price> = {
  "gpt-5.5": { input: 5, cachedInput: 0.5, output: 30 },
  "gpt-4o": { input: 2.5, cachedInput: 1.25, output: 10 },
};

function repoPath(...segments: string[]) {
  return path.join(process.cwd(), ...segments);
}

function usage(): never {
  console.error("Usage: npx tsx src/lib/Eval/scripts/fetch-openai-usage.ts [version ...]");
  console.error("Requires OPENAI_ADMIN_KEY or an OPENAI_API_KEY with api.usage.read scope.");
  process.exit(1);
}

function getApiKey() {
  return process.env.OPENAI_ADMIN_KEY || process.env.OPENAI_API_KEY;
}

function getPriceTable() {
  const override = process.env.OPENAI_USAGE_PRICE_JSON;
  if (!override) return DEFAULT_USD_PER_MILLION_TOKENS;

  const parsed = JSON.parse(override) as Record<string, Price>;
  return { ...DEFAULT_USD_PER_MILLION_TOKENS, ...parsed };
}

function getRunPath(version: string, testSet: TestSet) {
  return repoPath("src", "lib", "Eval", "runs", `${version}_${testSet}.json`);
}

async function readRun(version: string, testSet: TestSet) {
  const runPath = getRunPath(version, testSet);
  if (!existsSync(runPath)) return null;

  return JSON.parse(await readFile(runPath, "utf8")) as RunFile;
}

function getWindow(runFile: RunFile) {
  const startedAt = Date.parse(runFile.date);
  if (!Number.isFinite(startedAt)) throw new Error(`Invalid run date for ${runFile.version}_${runFile.test_set}`);

  const successfulCaseMs = runFile.cases.reduce((sum, result) => sum + (result.total_ms || 0), 0);
  const delayMs = Math.max(runFile.cases.length - 1, 0) * CASE_DELAY_MS;
  const paddingMs = WINDOW_PADDING_SECONDS * 1000;

  return {
    start_time: Math.floor((startedAt - paddingMs) / 1000),
    end_time: Math.ceil((startedAt + successfulCaseMs + delayMs + paddingMs) / 1000),
  };
}

function emptyTotals(): UsageTotals {
  return {
    input_tokens: 0,
    input_cached_tokens: 0,
    output_tokens: 0,
    num_model_requests: 0,
    estimated_cost_usd: null,
  };
}

function calculateCostUsd(model: string | null | undefined, inputTokens: number, cachedInputTokens: number, outputTokens: number) {
  const price = model ? getPriceTable()[model] : undefined;
  if (!price) return null;

  const uncachedInputTokens = Math.max(inputTokens - cachedInputTokens, 0);
  const inputCost = (uncachedInputTokens / 1_000_000) * price.input;
  const cachedInputCost = (cachedInputTokens / 1_000_000) * (price.cachedInput ?? price.input);
  const outputCost = (outputTokens / 1_000_000) * price.output;

  return inputCost + cachedInputCost + outputCost;
}

function addTotals(totals: UsageTotals, result: UsageResult) {
  const inputTokens = result.input_tokens || 0;
  const cachedInputTokens = result.input_cached_tokens || 0;
  const outputTokens = result.output_tokens || 0;
  const cost = calculateCostUsd(result.model, inputTokens, cachedInputTokens, outputTokens);

  totals.input_tokens += inputTokens;
  totals.input_cached_tokens += cachedInputTokens;
  totals.output_tokens += outputTokens;
  totals.num_model_requests += result.num_model_requests || 0;

  if (cost !== null) {
    totals.estimated_cost_usd = (totals.estimated_cost_usd ?? 0) + cost;
  }
}

async function fetchUsagePage(apiKey: string, params: URLSearchParams) {
  const url = new URL("https://api.openai.com/v1/organization/usage/completions");
  url.search = params.toString();

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const body = (await response.json()) as UsageResponse;

  if (!response.ok) {
    throw new Error(body.error?.message || `OpenAI usage request failed with HTTP ${response.status}`);
  }

  return body;
}

async function fetchUsage(apiKey: string, startTime: number, endTime: number) {
  const buckets: UsageBucket[] = [];
  let page: string | null | undefined;

  do {
    const params = new URLSearchParams({
      start_time: String(startTime),
      end_time: String(endTime),
      bucket_width: "1m",
      limit: "1440",
    });
    for (const group of ["model", "project_id", "api_key_id"]) params.append("group_by[]", group);
    if (page) params.set("page", page);

    const body = await fetchUsagePage(apiKey, params);
    buckets.push(...(body.data || []));
    page = body.next_page;
  } while (page);

  return buckets;
}

function summarizeBuckets(buckets: UsageBucket[]) {
  const totals = emptyTotals();
  const byModel = new Map<string, UsageTotals>();

  for (const bucket of buckets) {
    for (const result of bucket.results || []) {
      const model = result.model || "unknown";
      const modelTotals = byModel.get(model) || emptyTotals();
      addTotals(modelTotals, result);
      addTotals(totals, result);
      byModel.set(model, modelTotals);
    }
  }

  return {
    totals,
    by_model: Object.fromEntries([...byModel.entries()].sort(([a], [b]) => a.localeCompare(b))),
  };
}

async function main() {
  const apiKey = getApiKey();
  if (!apiKey) usage();

  const versions = process.argv.slice(2);
  const selectedVersions = versions.length ? versions : DEFAULT_VERSIONS;
  const report = {
    generated_at: new Date().toISOString(),
    source: "OpenAI Organization Usage API /v1/organization/usage/completions",
    note:
      "Costs are token-price estimates from the local price table. Use the OpenAI Costs API or dashboard for invoice reconciliation.",
    price_table_usd_per_million_tokens: getPriceTable(),
    versions: [] as Array<{
      version: string;
      test_sets: unknown[];
      totals: UsageTotals;
    }>,
  };

  for (const version of selectedVersions) {
    const versionTotals = emptyTotals();
    const testSets = [];

    for (const testSet of TEST_SETS) {
      const runFile = await readRun(version, testSet);
      if (!runFile) continue;

      const window = getWindow(runFile);
      const buckets = await fetchUsage(apiKey, window.start_time, window.end_time);
      const summary = summarizeBuckets(buckets);

      versionTotals.input_tokens += summary.totals.input_tokens;
      versionTotals.input_cached_tokens += summary.totals.input_cached_tokens;
      versionTotals.output_tokens += summary.totals.output_tokens;
      versionTotals.num_model_requests += summary.totals.num_model_requests;
      if (summary.totals.estimated_cost_usd !== null) {
        versionTotals.estimated_cost_usd =
          (versionTotals.estimated_cost_usd ?? 0) + summary.totals.estimated_cost_usd;
      }

      testSets.push({
        test_set: testSet,
        run_started_at: runFile.date,
        usage_window_utc: window,
        case_count: runFile.cases.length,
        ...summary,
      });
    }

    report.versions.push({ version, test_sets: testSets, totals: versionTotals });
  }

  await writeFile(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${path.relative(process.cwd(), OUTPUT_PATH)}`);
  for (const version of report.versions) {
    const cost =
      version.totals.estimated_cost_usd === null ? "n/a" : `$${version.totals.estimated_cost_usd.toFixed(4)}`;
    console.log(
      `${version.version}: ${version.totals.num_model_requests} requests, ${version.totals.input_tokens} input tokens, ${version.totals.output_tokens} output tokens, estimated ${cost}`,
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
