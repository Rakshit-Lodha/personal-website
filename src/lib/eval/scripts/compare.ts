import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CaseResult, RunFile, ScoreFile, TestSet } from "../types";

const TEST_SETS: TestSet[] = ["factual", "quality", "skeptic"];

type LatencyStats = {
  total_mean_ms: number;
  total_median_ms: number;
  total_p95_ms: number;
  first_delta_mean_ms: number;
  n: number;
  n_url_path?: number;
};

type EvaluationSummary = {
  version: string;
  date: string;
  system_prompt_sha: string;
  scores: Partial<Record<TestSet, Record<string, number>>>;
  latency: Partial<Record<TestSet, LatencyStats>> & {
    overall: LatencyStats;
    stages_mean_ms: Record<string, number>;
    by_websearch_path: {
      had_websearch: LatencyStats;
      no_websearch: LatencyStats;
    };
  };
};

function usage(): never {
  console.error("Usage: npx tsx src/lib/eval/scripts/compare.ts <version> [version_b]");
  process.exit(1);
}

function repoPath(...segments: string[]) {
  return path.join(process.cwd(), ...segments);
}

async function readJsonFile<T>(filePath: string) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round0(value: number) {
  return Math.round(value);
}

function sorted(values: number[]) {
  return [...values].sort((a, b) => a - b);
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const ordered = sorted(values);
  const midpoint = Math.floor(ordered.length / 2);
  if (ordered.length % 2 === 1) return ordered[midpoint];
  return (ordered[midpoint - 1] + ordered[midpoint]) / 2;
}

function p95(values: number[]) {
  if (values.length === 0) return 0;
  const ordered = sorted(values);
  return ordered[Math.max(0, Math.ceil(ordered.length * 0.95) - 1)];
}

function latencyStats(cases: CaseResult[]): LatencyStats {
  const totals = cases.map((testCase) => testCase.total_ms).filter((value) => value > 0);
  const firstDeltas = cases
    .map((testCase) => testCase.first_delta_ms)
    .filter((value): value is number => typeof value === "number");

  return {
    total_mean_ms: round0(mean(totals)),
    total_median_ms: round0(median(totals)),
    total_p95_ms: round0(p95(totals)),
    first_delta_mean_ms: round0(mean(firstDeltas)),
    n: cases.length,
  };
}

function hasWebsearch(testCase: CaseResult) {
  return testCase.stages.some((stage) => stage.stage === "websearch_start" || stage.stage === "websearch_complete");
}

function stageDuration(testCase: CaseResult, stageName: "websearch" | "context" | "answer") {
  const start = testCase.stages.find((stage) => stage.stage === `${stageName}_start`);
  const complete = testCase.stages.find((stage) => stage.stage === `${stageName}_complete`);
  if (!start || !complete) return null;

  const duration = complete.elapsed_ms - start.elapsed_ms;
  return duration >= 0 ? duration : null;
}

function stageMeans(cases: CaseResult[]) {
  const websearch = cases.map((testCase) => stageDuration(testCase, "websearch")).filter((value): value is number => value !== null);
  const context = cases.map((testCase) => stageDuration(testCase, "context")).filter((value): value is number => value !== null);
  const answer = cases.map((testCase) => stageDuration(testCase, "answer")).filter((value): value is number => value !== null);

  return {
    websearch: round0(mean(websearch)),
    context: round0(mean(context)),
    answer: round0(mean(answer)),
  };
}

function formatSeconds(ms: number) {
  return `${(Math.round(ms / 100) / 10).toFixed(1)}s`;
}

function formatPercent(value: number | undefined) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

function formatAvg(value: number | undefined) {
  return `${(value ?? 0).toFixed(1)}/4`;
}

function titleCase(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

async function loadScore(version: string, testSet: TestSet) {
  const scorePath = repoPath("src", "lib", "eval", "scores", `${version}_${testSet}.json`);
  if (!existsSync(scorePath)) {
    console.warn(`Missing score file, skipping ${testSet}: ${path.relative(process.cwd(), scorePath)}`);
    return null;
  }

  return readJsonFile<ScoreFile>(scorePath);
}

async function loadRun(version: string, testSet: TestSet) {
  const runPath = repoPath("src", "lib", "eval", "runs", `${version}_${testSet}.json`);
  if (!existsSync(runPath)) {
    console.warn(`Missing run file, skipping latency for ${testSet}: ${path.relative(process.cwd(), runPath)}`);
    return null;
  }

  return readJsonFile<RunFile>(runPath);
}

async function computeSummary(version: string): Promise<EvaluationSummary> {
  const scores: EvaluationSummary["scores"] = {};
  const latency: Partial<Record<TestSet, LatencyStats>> = {};
  const allCases: CaseResult[] = [];
  const shas: string[] = [];

  for (const testSet of TEST_SETS) {
    const scoreFile = await loadScore(version, testSet);
    if (scoreFile) {
      scores[testSet] = scoreFile.summary;
    }

    const runFile = await loadRun(version, testSet);
    if (runFile) {
      const stats = latencyStats(runFile.cases);
      stats.n_url_path = runFile.cases.filter(hasWebsearch).length;
      latency[testSet] = stats;
      allCases.push(...runFile.cases);
      if (runFile.system_prompt_sha) shas.push(runFile.system_prompt_sha);
    }
  }

  const hadWebsearch = allCases.filter(hasWebsearch);
  const noWebsearch = allCases.filter((testCase) => !hasWebsearch(testCase));

  return {
    version,
    date: new Date().toISOString(),
    system_prompt_sha: shas[0] ?? "unknown",
    scores,
    latency: {
      ...latency,
      overall: latencyStats(allCases),
      stages_mean_ms: stageMeans(allCases),
      by_websearch_path: {
        had_websearch: latencyStats(hadWebsearch),
        no_websearch: latencyStats(noWebsearch),
      },
    },
  };
}

function scoreRows(summary: EvaluationSummary) {
  const rows: string[] = [
    "| Test Set | N | Metric | Score |",
    "|---|---:|---|---:|",
  ];
  const factual = summary.scores.factual;
  const quality = summary.scores.quality;
  const skeptic = summary.scores.skeptic;

  if (factual) rows.push(`| Factual | ${factual.n ?? 0} | Pass rate | ${formatPercent(factual.pass_rate)} |`);
  if (quality) {
    rows.push(`| Quality | ${quality.n ?? 0} | Specificity (avg) | ${formatAvg(quality.specificity_avg)} |`);
    rows.push(`| Quality | ${quality.n ?? 0} | Evidence-citation (avg) | ${formatAvg(quality.evidence_citation_avg)} |`);
    rows.push(`| Quality | ${quality.n ?? 0} | Anti-hallucination (avg) | ${formatAvg(quality.anti_hallucination_avg)} |`);
    rows.push(`| Quality | ${quality.n ?? 0} | Overall avg | ${formatAvg(quality.overall_avg)} |`);
  }
  if (skeptic) {
    rows.push(`| Skeptic | ${skeptic.n ?? 0} | Fit-level accuracy | ${formatPercent(skeptic.fit_level_accuracy)} |`);
    rows.push(`| Skeptic | ${skeptic.n ?? 0} | Target alignment (avg) | ${formatAvg(skeptic.target_alignment_avg ?? skeptic.specificity_avg)} |`);
    rows.push(`| Skeptic | ${skeptic.n ?? 0} | Fit calibration (avg) | ${formatAvg(skeptic.fit_calibration_avg)} |`);
    rows.push(`| Skeptic | ${skeptic.n ?? 0} | Explanation overall avg | ${formatAvg(skeptic.overall_avg)} |`);
  }

  return rows.join("\n");
}

function latencyRows(summary: EvaluationSummary) {
  const rows: string[] = [
    "| Test Set | N | Mean Total | Median Total | p95 Total | Mean First Delta |",
    "|---|---:|---:|---:|---:|---:|",
  ];

  for (const testSet of TEST_SETS) {
    const stats = summary.latency[testSet];
    if (!stats) continue;
    rows.push(
      `| ${titleCase(testSet)} | ${stats.n} | ${formatSeconds(stats.total_mean_ms)} | ${formatSeconds(stats.total_median_ms)} | ${formatSeconds(stats.total_p95_ms)} | ${formatSeconds(stats.first_delta_mean_ms)} |`,
    );
  }

  const overall = summary.latency.overall;
  rows.push(
    `| **All** | ${overall.n} | ${formatSeconds(overall.total_mean_ms)} | ${formatSeconds(overall.total_median_ms)} | ${formatSeconds(overall.total_p95_ms)} | ${formatSeconds(overall.first_delta_mean_ms)} |`,
  );

  return rows.join("\n");
}

function stageRows(summary: EvaluationSummary) {
  const stages = summary.latency.stages_mean_ms;
  return [
    "| Stage | Mean |",
    "|---|---:|",
    `| Websearch | ${formatSeconds(stages.websearch ?? 0)} |`,
    `| Context | ${formatSeconds(stages.context ?? 0)} |`,
    `| Answer | ${formatSeconds(stages.answer ?? 0)} |`,
  ].join("\n");
}

function renderSummaryMarkdown(summary: EvaluationSummary) {
  return `# ${summary.version.toUpperCase()} Evaluation Summary

Date: ${summary.date.slice(0, 10)}
System prompt SHA: ${summary.system_prompt_sha}

## Scores

${scoreRows(summary)}

## Latency

${latencyRows(summary)}

## Stage Latency (mean)

${stageRows(summary)}

Notes:
- Single-run timings. Run-to-run variance from upstream APIs is typically 20-50%.
- Stage means computed only across cases where the stage ran.
`;
}

function diffNumber(b: number | undefined, a: number | undefined) {
  return (b ?? 0) - (a ?? 0);
}

function signed(value: number, digits = 2) {
  const formatted = value.toFixed(digits);
  return value > 0 ? `+${formatted}` : formatted;
}

function signedMs(value: number) {
  return value > 0 ? `+${Math.round(value)}` : `${Math.round(value)}`;
}

function scoreDeltaRows(a: EvaluationSummary, b: EvaluationSummary) {
  const rows = [
    "| Metric | " + `${a.version} | ${b.version} | Δ |`,
    "|---|---:|---:|---:|",
  ];

  const metrics: Array<[string, number | undefined, number | undefined, "score" | "percent"]> = [
    ["Factual pass rate", a.scores.factual?.pass_rate, b.scores.factual?.pass_rate, "percent"],
    ["Quality overall avg", a.scores.quality?.overall_avg, b.scores.quality?.overall_avg, "score"],
    ["Skeptic fit-level accuracy", a.scores.skeptic?.fit_level_accuracy, b.scores.skeptic?.fit_level_accuracy, "percent"],
    ["Skeptic target alignment", a.scores.skeptic?.target_alignment_avg, b.scores.skeptic?.target_alignment_avg, "score"],
    ["Skeptic fit calibration", a.scores.skeptic?.fit_calibration_avg, b.scores.skeptic?.fit_calibration_avg, "score"],
    ["Skeptic explanation overall avg", a.scores.skeptic?.overall_avg, b.scores.skeptic?.overall_avg, "score"],
  ];

  for (const [label, aValue, bValue, kind] of metrics) {
    const delta = diffNumber(bValue, aValue);
    const regression = delta < 0 ? " (regression)" : "";
    const formattedA = kind === "percent" ? formatPercent(aValue) : formatAvg(aValue);
    const formattedB = kind === "percent" ? formatPercent(bValue) : formatAvg(bValue);
    const formattedDelta = kind === "percent" ? signed(delta * 100, 0) + "pp" : signed(delta, 1);
    rows.push(`| ${label} | ${formattedA} | ${formattedB} | ${formattedDelta}${regression} |`);
  }

  return rows.join("\n");
}

function latencyDeltaRows(a: EvaluationSummary, b: EvaluationSummary) {
  const rows = [
    "| Metric | " + `${a.version} | ${b.version} | Δ |`,
    "|---|---:|---:|---:|",
  ];

  const metrics: Array<[string, number, number]> = [
    ["Overall mean total", a.latency.overall.total_mean_ms, b.latency.overall.total_mean_ms],
    ["Overall mean first delta", a.latency.overall.first_delta_mean_ms, b.latency.overall.first_delta_mean_ms],
    ["Websearch mean", a.latency.stages_mean_ms.websearch ?? 0, b.latency.stages_mean_ms.websearch ?? 0],
    ["Context mean", a.latency.stages_mean_ms.context ?? 0, b.latency.stages_mean_ms.context ?? 0],
    ["Answer mean", a.latency.stages_mean_ms.answer ?? 0, b.latency.stages_mean_ms.answer ?? 0],
  ];

  for (const [label, aValue, bValue] of metrics) {
    const delta = bValue - aValue;
    const regression = delta > 0 ? " (regression)" : "";
    rows.push(`| ${label} | ${formatSeconds(aValue)} | ${formatSeconds(bValue)} | ${formatSeconds(delta)}${regression} |`);
  }

  return rows.join("\n");
}

function renderDiffMarkdown(a: EvaluationSummary, b: EvaluationSummary) {
  return `# ${a.version.toUpperCase()} vs ${b.version.toUpperCase()} Evaluation Diff

Generated: ${new Date().toISOString().slice(0, 10)}

## Scores

${scoreDeltaRows(a, b)}

## Latency

${latencyDeltaRows(a, b)}

Notes:
- Score regressions are lower values.
- Latency regressions are higher values.
`;
}

async function writeSummary(summary: EvaluationSummary) {
  const outputDir = repoPath("src", "lib", "eval", "summaries");
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, `${summary.version}_summary.json`), `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(path.join(outputDir, `${summary.version}_summary.md`), renderSummaryMarkdown(summary));
}

async function writeDiff(a: EvaluationSummary, b: EvaluationSummary) {
  const outputDir = repoPath("src", "lib", "eval", "summaries");
  await mkdir(outputDir, { recursive: true });

  const diff = {
    version_a: a.version,
    version_b: b.version,
    summary_a: a,
    summary_b: b,
    scores_delta: {
      factual_pass_rate: signed(diffNumber(b.scores.factual?.pass_rate, a.scores.factual?.pass_rate)),
      quality_overall_avg: signed(diffNumber(b.scores.quality?.overall_avg, a.scores.quality?.overall_avg), 1),
      skeptic_fit_level_accuracy: signed(
        diffNumber(b.scores.skeptic?.fit_level_accuracy, a.scores.skeptic?.fit_level_accuracy),
      ),
    },
    latency_delta: {
      overall_mean_ms: signedMs(b.latency.overall.total_mean_ms - a.latency.overall.total_mean_ms),
      overall_first_delta_mean_ms: signedMs(
        b.latency.overall.first_delta_mean_ms - a.latency.overall.first_delta_mean_ms,
      ),
    },
  };

  await writeFile(path.join(outputDir, `${a.version}_vs_${b.version}.json`), `${JSON.stringify(diff, null, 2)}\n`);
  await writeFile(path.join(outputDir, `${a.version}_vs_${b.version}.md`), renderDiffMarkdown(a, b));
}

async function main() {
  const [, , versionA, versionB] = process.argv;
  if (!versionA) usage();

  if (!versionB) {
    const summary = await computeSummary(versionA);
    await writeSummary(summary);
    console.log(`✓ Wrote summary for ${versionA}`);
    return;
  }

  const summaryA = await computeSummary(versionA);
  const summaryB = await computeSummary(versionB);
  await writeSummary(summaryA);
  await writeSummary(summaryB);
  await writeDiff(summaryA, summaryB);
  console.log(`✓ Wrote diff for ${versionA} vs ${versionB}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
