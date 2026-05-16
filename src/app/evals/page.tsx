import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import Nav from "@/components/Nav";

export const dynamic = "force-dynamic";

type TestSet = "factual" | "quality" | "skeptic";

type StageTiming = {
  stage: string;
  elapsed_ms: number;
  message: string;
};

type CaseResult = {
  id: string;
  question: string;
  expected: string | null;
  response: Record<string, unknown> | null;
  answer_text: string;
  stages: StageTiming[];
  first_delta_ms: number | null;
  total_ms: number;
  error?: string;
};

type RunFile = {
  version: string;
  test_set: TestSet;
  date: string;
  system_prompt_sha: string;
  api_url: string;
  cases: CaseResult[];
};

type FactualScore = {
  id: string;
  pass: boolean;
  reasoning: string;
};

type QualityScore = {
  id: string;
  specificity: number;
  evidence_citation: number;
  anti_hallucination: number;
  reasoning: string;
};

type SkepticScore = {
  id: string;
  fit_level_correct: boolean;
  expected_fit_level: string;
  actual_fit_level: string;
  specificity: number;
  evidence_citation: number;
  anti_hallucination: number;
  reasoning: string;
};

type ScoreFile = {
  version: string;
  test_set: TestSet;
  judge_model: string;
  date: string;
  cases: Array<FactualScore | QualityScore | SkepticScore>;
  summary: Record<string, number>;
};

type VersionData = {
  version: string;
  summary: EvalSummary;
  runs: Partial<Record<TestSet, RunFile>>;
  scores: Partial<Record<TestSet, ScoreFile>>;
};

type LatencyStats = {
  n: number;
  total_mean_ms: number;
  total_median_ms: number;
  total_p95_ms: number;
  first_delta_mean_ms: number;
  n_url_path?: number;
};

type EvalSummary = {
  version: string;
  date: string;
  system_prompt_sha: string;
  scores: Partial<Record<TestSet, Record<string, number>>>;
  latency: Partial<Record<TestSet, LatencyStats>> & {
    overall: LatencyStats;
    stages_mean_ms: Record<string, number>;
    by_websearch_path?: {
      had_websearch: LatencyStats;
      no_websearch: LatencyStats;
    };
  };
};

const TEST_SETS: TestSet[] = ["factual", "quality", "skeptic"];
const TEST_SET_LABELS: Record<TestSet, string> = {
  factual: "Factual",
  quality: "Quality",
  skeptic: "Skeptic",
};

function evalPath(...segments: string[]) {
  return path.join(process.cwd(), "src", "lib", "eval", ...segments);
}

function readJson<T>(filePath: string): T | null {
  if (!existsSync(filePath)) return null;

  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}

function listJsonFiles(dir: string) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((file) => file.endsWith(".json"));
}

function discoverVersions() {
  const versions = new Set<string>();

  for (const file of listJsonFiles(evalPath("summaries"))) {
    const match = file.match(/^(.+)_summary\.json$/);
    if (match?.[1]) versions.add(match[1]);
  }

  for (const dir of ["runs", "scores"]) {
    for (const file of listJsonFiles(evalPath(dir))) {
      const match = file.match(/^(.+)_(factual|quality|skeptic)\.json$/);
      if (match?.[1]) versions.add(match[1]);
    }
  }

  return [...versions].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
}

function mean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sorted(values: number[]) {
  return [...values].sort((a, b) => a - b);
}

function median(values: number[]) {
  if (!values.length) return 0;
  const valuesSorted = sorted(values);
  const middle = Math.floor(valuesSorted.length / 2);
  return valuesSorted.length % 2 ? valuesSorted[middle] : (valuesSorted[middle - 1] + valuesSorted[middle]) / 2;
}

function p95(values: number[]) {
  if (!values.length) return 0;
  return sorted(values)[Math.max(0, Math.ceil(values.length * 0.95) - 1)];
}

function latencyStats(cases: CaseResult[]): LatencyStats {
  const totals = cases.map((testCase) => testCase.total_ms).filter((value) => value > 0);
  const firstDeltas = cases
    .map((testCase) => testCase.first_delta_ms)
    .filter((value): value is number => typeof value === "number");

  return {
    n: cases.length,
    total_mean_ms: Math.round(mean(totals)),
    total_median_ms: Math.round(median(totals)),
    total_p95_ms: Math.round(p95(totals)),
    first_delta_mean_ms: Math.round(mean(firstDeltas)),
  };
}

function hasWebsearch(testCase: CaseResult) {
  return testCase.stages.some((stage) => stage.stage === "websearch_start" || stage.stage === "websearch_complete");
}

function stageDuration(testCase: CaseResult, stage: "websearch" | "context" | "answer") {
  const start = testCase.stages.find((item) => item.stage === `${stage}_start`);
  const complete = testCase.stages.find((item) => item.stage === `${stage}_complete`);
  if (!start || !complete) return null;

  const duration = complete.elapsed_ms - start.elapsed_ms;
  return duration >= 0 ? duration : null;
}

function stageMean(cases: CaseResult[], stage: "websearch" | "context" | "answer") {
  return Math.round(
    mean(cases.map((testCase) => stageDuration(testCase, stage)).filter((value): value is number => value !== null)),
  );
}

function fallbackSummary(version: string, runs: Partial<Record<TestSet, RunFile>>, scores: Partial<Record<TestSet, ScoreFile>>): EvalSummary {
  const allCases = TEST_SETS.flatMap((testSet) => runs[testSet]?.cases ?? []);
  const latency: Partial<Record<TestSet, LatencyStats>> = {};
  const hadWebsearch = allCases.filter(hasWebsearch);
  const noWebsearch = allCases.filter((testCase) => !hasWebsearch(testCase));

  for (const testSet of TEST_SETS) {
    const run = runs[testSet];
    if (!run) continue;
    latency[testSet] = {
      ...latencyStats(run.cases),
      n_url_path: run.cases.filter(hasWebsearch).length,
    };
  }

  return {
    version,
    date: new Date().toISOString(),
    system_prompt_sha: TEST_SETS.map((testSet) => runs[testSet]?.system_prompt_sha).find(Boolean) ?? "unknown",
    scores: Object.fromEntries(
      TEST_SETS.flatMap((testSet) => {
        const score = scores[testSet];
        return score ? [[testSet, score.summary]] : [];
      }),
    ) as EvalSummary["scores"],
    latency: {
      ...latency,
      overall: latencyStats(allCases),
      stages_mean_ms: {
        websearch: stageMean(allCases, "websearch"),
        context: stageMean(allCases, "context"),
        answer: stageMean(allCases, "answer"),
      },
      by_websearch_path: {
        had_websearch: latencyStats(hadWebsearch),
        no_websearch: latencyStats(noWebsearch),
      },
    },
  };
}

function loadVersion(version: string): VersionData {
  const runs: Partial<Record<TestSet, RunFile>> = {};
  const scores: Partial<Record<TestSet, ScoreFile>> = {};

  for (const testSet of TEST_SETS) {
    const run = readJson<RunFile>(evalPath("runs", `${version}_${testSet}.json`));
    const score = readJson<ScoreFile>(evalPath("scores", `${version}_${testSet}.json`));
    if (run) runs[testSet] = run;
    if (score) scores[testSet] = score;
  }

  const summary =
    readJson<EvalSummary>(evalPath("summaries", `${version}_summary.json`)) ?? fallbackSummary(version, runs, scores);

  return { version, summary, runs, scores };
}

function seconds(ms: number | undefined) {
  return `${(((ms ?? 0) / 1000) || 0).toFixed(1)}s`;
}

function percent(value: number | undefined) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

function score(value: number | undefined) {
  return `${(value ?? 0).toFixed(1)}/4`;
}

function metricWidth(value: number | undefined, max: number) {
  return `${Math.min(100, Math.max(0, ((value ?? 0) / max) * 100))}%`;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function scoreStatus(testSet: TestSet, summary: Record<string, number> | undefined) {
  if (!summary) return { label: "Missing", value: 0, max: 1, display: "No scores" };
  if (testSet === "factual") {
    return { label: "Pass rate", value: summary.pass_rate ?? 0, max: 1, display: percent(summary.pass_rate) };
  }
  if (testSet === "skeptic") {
    return {
      label: "Fit-level accuracy",
      value: summary.fit_level_accuracy ?? 0,
      max: 1,
      display: percent(summary.fit_level_accuracy),
    };
  }
  return { label: "Overall avg", value: summary.overall_avg ?? 0, max: 4, display: score(summary.overall_avg) };
}

function scoreTone(value: number, max: number) {
  const ratio = max ? value / max : 0;
  if (ratio >= 0.8) return "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]";
  if (ratio >= 0.6) return "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]";
  if (ratio >= 0.4) return "bg-[#fffbeb] text-[#b45309] border-[#fde68a]";
  return "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]";
}

function Bar({ value, max, tone = "bg-[#1B6AE7]" }: { value: number; max: number; tone?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#e4e0da]">
      <div className={`h-full rounded-full ${tone}`} style={{ width: metricWidth(value, max) }} />
    </div>
  );
}

function HeroMetrics({ version }: { version: VersionData }) {
  const { summary } = version;
  const factual = summary.scores.factual;
  const quality = summary.scores.quality;
  const skeptic = summary.scores.skeptic;

  return (
    <section className="grid gap-3 md:grid-cols-4">
      <MetricPanel label="Factual pass" value={percent(factual?.pass_rate)} helper={`${factual?.n ?? 0} recall checks`} />
      <MetricPanel label="Quality score" value={score(quality?.overall_avg)} helper="Specificity + evidence + grounding" />
      <MetricPanel label="Fit accuracy" value={percent(skeptic?.fit_level_accuracy)} helper={`${skeptic?.n ?? 0} role/JD checks`} />
      <MetricPanel label="Mean latency" value={seconds(summary.latency.overall.total_mean_ms)} helper={`${summary.latency.overall.n} cases`} />
    </section>
  );
}

function MetricPanel({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-lg border border-[#e4e0da] bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#6b6860]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#111111]">{value}</p>
      <p className="mt-1 text-xs text-[#6b6860]">{helper}</p>
    </div>
  );
}

function ScoreGrid({ version }: { version: VersionData }) {
  return (
    <section className="rounded-lg border border-[#e4e0da] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#111111]">Score Coverage</h2>
          <p className="mt-1 text-sm text-[#6b6860]">Judge scores by test set. Lower bars are where V2 should focus.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {TEST_SETS.map((testSet) => {
          const metric = scoreStatus(testSet, version.summary.scores[testSet]);
          return (
            <div key={testSet} className="rounded-lg border border-[#ede9e3] bg-[#faf9f6] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-[#111111]">{TEST_SET_LABELS[testSet]}</p>
                <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${scoreTone(metric.value, metric.max)}`}>
                  {metric.display}
                </span>
              </div>
              <p className="mt-2 text-xs text-[#6b6860]">{metric.label}</p>
              <div className="mt-4">
                <Bar value={metric.value} max={metric.max} />
              </div>
              {testSet !== "factual" && version.summary.scores[testSet] ? (
                <div className="mt-4 space-y-2 text-xs text-[#6b6860]">
                  <ScoreLine label="Specificity" value={version.summary.scores[testSet]?.specificity_avg} />
                  <ScoreLine label="Evidence" value={version.summary.scores[testSet]?.evidence_citation_avg} />
                  <ScoreLine label="Grounding" value={version.summary.scores[testSet]?.anti_hallucination_avg} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ScoreLine({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="grid grid-cols-[88px_1fr_42px] items-center gap-2">
      <span>{label}</span>
      <Bar value={value ?? 0} max={4} tone="bg-[#6b6860]" />
      <span className="text-right">{score(value)}</span>
    </div>
  );
}

function LatencyGrid({ version }: { version: VersionData }) {
  const stageMax = Math.max(
    1,
    version.summary.latency.stages_mean_ms.websearch ?? 0,
    version.summary.latency.stages_mean_ms.context ?? 0,
    version.summary.latency.stages_mean_ms.answer ?? 0,
  );

  return (
    <section className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
      <div className="rounded-lg border border-[#e4e0da] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#111111]">Latency by Test Set</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-[#6b6860]">
              <tr className="border-b border-[#ede9e3]">
                <th className="pb-2 font-medium">Set</th>
                <th className="pb-2 font-medium">N</th>
                <th className="pb-2 font-medium">Mean</th>
                <th className="pb-2 font-medium">Median</th>
                <th className="pb-2 font-medium">p95</th>
                <th className="pb-2 font-medium">First token</th>
              </tr>
            </thead>
            <tbody>
              {TEST_SETS.map((testSet) => {
                const stats = version.summary.latency[testSet];
                if (!stats) return null;
                return <LatencyRow key={testSet} label={TEST_SET_LABELS[testSet]} stats={stats} />;
              })}
              <LatencyRow label="All" stats={version.summary.latency.overall} strong />
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-[#e4e0da] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#111111]">Pipeline Stages</h2>
        <p className="mt-1 text-sm text-[#6b6860]">Mean elapsed time from stage start to completion.</p>
        <div className="mt-5 space-y-4">
          {[
            ["Websearch", version.summary.latency.stages_mean_ms.websearch ?? 0],
            ["Context", version.summary.latency.stages_mean_ms.context ?? 0],
            ["Answer", version.summary.latency.stages_mean_ms.answer ?? 0],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-[#111111]">{label}</span>
                <span className="text-[#6b6860]">{seconds(value as number)}</span>
              </div>
              <Bar value={value as number} max={stageMax} />
            </div>
          ))}
        </div>
        {stageMax === 1 ? (
          <p className="mt-4 rounded-lg bg-[#fffbeb] px-3 py-2 text-xs leading-relaxed text-[#b45309]">
            Stage data is missing or zero in this run. Deploy the telemetry build before capturing V2 to populate this chart.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function LatencyRow({ label, stats, strong = false }: { label: string; stats: LatencyStats; strong?: boolean }) {
  return (
    <tr className={`border-b border-[#f0ede8] last:border-b-0 ${strong ? "font-semibold text-[#111111]" : "text-[#34312c]"}`}>
      <td className="py-3">{label}</td>
      <td className="py-3">{stats.n}</td>
      <td className="py-3">{seconds(stats.total_mean_ms)}</td>
      <td className="py-3">{seconds(stats.total_median_ms)}</td>
      <td className="py-3">{seconds(stats.total_p95_ms)}</td>
      <td className="py-3">{seconds(stats.first_delta_mean_ms)}</td>
    </tr>
  );
}

function getScore(version: VersionData, testSet: TestSet, id: string) {
  return version.scores[testSet]?.cases.find((item) => item.id === id);
}

function caseHealth(testSet: TestSet, scoreItem: FactualScore | QualityScore | SkepticScore | undefined) {
  if (!scoreItem) return { label: "Missing score", tone: "bg-[#f5f3ef] text-[#6b6860] border-[#e4e0da]" };
  if (testSet === "factual") {
    return (scoreItem as FactualScore).pass
      ? { label: "Pass", tone: "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]" }
      : { label: "Fail", tone: "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]" };
  }
  if (testSet === "skeptic") {
    return (scoreItem as SkepticScore).fit_level_correct
      ? { label: "Fit match", tone: "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]" }
      : { label: "Fit mismatch", tone: "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]" };
  }
  const quality = scoreItem as QualityScore;
  const overall = mean([quality.specificity, quality.evidence_citation, quality.anti_hallucination]);
  return overall >= 3
    ? { label: `${overall.toFixed(1)}/4`, tone: "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]" }
    : { label: `${overall.toFixed(1)}/4`, tone: "bg-[#fffbeb] text-[#b45309] border-[#fde68a]" };
}

function scoreDetails(testSet: TestSet, scoreItem: FactualScore | QualityScore | SkepticScore | undefined) {
  if (!scoreItem) return "No judge score found for this case.";
  if (testSet === "factual") return (scoreItem as FactualScore).reasoning;
  if (testSet === "quality") {
    const quality = scoreItem as QualityScore;
    return `Specificity ${quality.specificity}/4 · Evidence ${quality.evidence_citation}/4 · Grounding ${quality.anti_hallucination}/4. ${quality.reasoning}`;
  }
  const skeptic = scoreItem as SkepticScore;
  return `Expected ${skeptic.expected_fit_level}; got ${skeptic.actual_fit_level}. Specificity ${skeptic.specificity}/4 · Evidence ${skeptic.evidence_citation}/4 · Grounding ${skeptic.anti_hallucination}/4. ${skeptic.reasoning}`;
}

function interestingCases(version: VersionData) {
  const rows: Array<{
    testSet: TestSet;
    caseResult: CaseResult;
    scoreItem: FactualScore | QualityScore | SkepticScore | undefined;
  }> = [];

  for (const testSet of TEST_SETS) {
    for (const caseResult of version.runs[testSet]?.cases ?? []) {
      const scoreItem = getScore(version, testSet, caseResult.id);
      const health = caseHealth(testSet, scoreItem);
      if (health.label.includes("Fail") || health.label.includes("mismatch") || caseResult.error) {
        rows.push({ testSet, caseResult, scoreItem });
      }
    }
  }

  if (rows.length) return rows.slice(0, 8);

  return TEST_SETS.flatMap((testSet) =>
    (version.runs[testSet]?.cases ?? []).slice(0, 2).map((caseResult) => ({
      testSet,
      caseResult,
      scoreItem: getScore(version, testSet, caseResult.id),
    })),
  ).slice(0, 8);
}

function CaseInspection({ version }: { version: VersionData }) {
  const cases = interestingCases(version);

  return (
    <section className="rounded-lg border border-[#e4e0da] bg-white p-5">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#111111]">What Needs Attention</h2>
          <p className="mt-1 text-sm text-[#6b6860]">Failed or mismatched cases first, with judge reasoning and latency.</p>
        </div>
        <p className="text-xs text-[#6b6860]">{cases.length} shown</p>
      </div>
      <div className="mt-5 space-y-3">
        {cases.map(({ testSet, caseResult, scoreItem }) => {
          const health = caseHealth(testSet, scoreItem);
          return (
            <details key={`${testSet}-${caseResult.id}`} className="rounded-lg border border-[#ede9e3] bg-[#faf9f6] p-4">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-[#6b6860]">{caseResult.id}</span>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-[#6b6860] ring-1 ring-[#e4e0da]">
                  {TEST_SET_LABELS[testSet]}
                </span>
                <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${health.tone}`}>{health.label}</span>
                <span className="ml-auto text-xs text-[#6b6860]">{seconds(caseResult.total_ms)}</span>
              </summary>
              <div className="mt-4 grid gap-4 md:grid-cols-[0.9fr_1fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6b6860]">Prompt</p>
                  <p className="mt-2 line-clamp-6 text-sm leading-relaxed text-[#34312c]">{caseResult.question}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6b6860]">Judge reasoning</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#34312c]">{scoreDetails(testSet, scoreItem)}</p>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}

function VersionSection({ version }: { version: VersionData }) {
  return (
    <section id={version.version} className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-[#e4e0da] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b6860]">Version</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-[#111111]">{version.version.toUpperCase()}</h1>
          <p className="mt-2 text-sm text-[#6b6860]">
            Captured {formatDate(version.summary.date)} · SHA {version.summary.system_prompt_sha.slice(0, 7)}
          </p>
        </div>
        <Link
          href="/chat"
          className="inline-flex w-fit items-center rounded-full border border-[#e4e0da] bg-white px-4 py-2 text-sm font-medium text-[#34312c] transition-colors hover:border-[#cfc8be] hover:bg-[#faf9f6]"
        >
          Back to chat →
        </Link>
      </div>
      <HeroMetrics version={version} />
      <ScoreGrid version={version} />
      <LatencyGrid version={version} />
      <CaseInspection version={version} />
    </section>
  );
}

export default function EvalsPage() {
  const versions = discoverVersions().map(loadVersion);
  const latestVersion = versions[0];

  return (
    <>
      <Nav sectionHrefPrefix="/" />
      <main className="min-h-screen bg-[#F5F3EF] px-6 pt-24 pb-16 text-[#111111] md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1B6AE7]">Agent evals</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#111111] md:text-5xl">
              Is the hiring agent grounded?
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#34312c] md:text-lg">
              A visual readout of factual recall, answer quality, fit-judgment accuracy, and latency. New versions appear here
              automatically when their run, score, or summary JSON files are generated.
            </p>
          </div>

          {versions.length > 1 ? (
            <div className="mb-8 flex flex-wrap gap-2">
              {versions.map((version) => (
                <a
                  key={version.version}
                  href={`#${version.version}`}
                  className="rounded-full border border-[#e4e0da] bg-white px-3 py-1.5 text-sm font-medium text-[#34312c] transition-colors hover:border-[#cfc8be] hover:bg-[#faf9f6]"
                >
                  {version.version.toUpperCase()}
                </a>
              ))}
            </div>
          ) : null}

          {latestVersion ? (
            <div className="space-y-12">
              {versions.map((version) => (
                <VersionSection key={version.version} version={version} />
              ))}
            </div>
          ) : (
            <section className="rounded-lg border border-[#e4e0da] bg-white p-6">
              <h2 className="text-xl font-semibold text-[#111111]">No eval runs yet</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6b6860]">
                Run `npx tsx src/lib/eval/scripts/run-eval.ts v1 factual`, then judge and compare the version to populate this page.
              </p>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
