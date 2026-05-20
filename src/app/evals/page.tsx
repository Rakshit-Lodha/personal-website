import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, Gauge, SearchCheck, ShieldCheck, TriangleAlert } from "lucide-react";
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
  prompt_version?: string;
  profile_version?: string;
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
  core_criteria?: string[];
  matched_criteria?: string[];
  missing_or_weak_criteria?: string[];
  target_alignment?: number;
  fit_calibration?: number;
  specificity?: number;
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
  prompt_version?: string;
  profile_version?: string;
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
  factual: "Factual recall",
  quality: "Answer quality",
  skeptic: "Fit judgment",
};

const FINAL_EVAL_VERSION = "v3Pipeline_tightened";
const BASELINE_EVAL_VERSION = "v1";
const COMPARISON_EVAL_VERSIONS = ["v1", "v2_prompt", FINAL_EVAL_VERSION] as const;
const FINAL_EVAL_LABEL = "V3 final";

const TEST_SET_EXPLAINERS: Record<TestSet, { short: string; detail: string }> = {
  factual: {
    short: "Can it remember known profile facts?",
    detail: "20 known-answer checks for dates, projects, tools, outcomes, and agent behavior. This verifies the agent can retrieve facts without inventing or missing profile evidence.",
  },
  quality: {
    short: "Does it answer with useful evidence?",
    detail: "20 open-ended Q&A prompts judged on specificity, evidence citation, and anti-hallucination. This catches vague resume-speak and unsupported process claims.",
  },
  skeptic: {
    short: "Can it avoid over-selling fit?",
    detail: "12 role, company, and JD-style prompts judged on target alignment, fit calibration, evidence, and grounding. This tests whether fit labels stay conservative.",
  },
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
    prompt_version: TEST_SETS.map((testSet) => runs[testSet]?.prompt_version).find(Boolean),
    profile_version: TEST_SETS.map((testSet) => runs[testSet]?.profile_version).find(Boolean),
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

function scorePercent(value: number | undefined) {
  return `${Math.round(((value ?? 0) / 4) * 100)}%`;
}

function signedPercentPoints(value: number | undefined) {
  const points = Math.round((value ?? 0) * 100);
  return points > 0 ? `+${points}pp` : `${points}pp`;
}

function signedScorePercentPoints(value: number | undefined) {
  const points = Math.round(((value ?? 0) / 4) * 100);
  return points > 0 ? `+${points}pp` : `${points}pp`;
}

function signedSeconds(value: number | undefined) {
  const secondsValue = (value ?? 0) / 1000;
  return secondsValue > 0 ? `+${secondsValue.toFixed(1)}s` : `${secondsValue.toFixed(1)}s`;
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

function versionLabel(version: VersionData) {
  if (version.version === FINAL_EVAL_VERSION) return "Final V3 evaluation";
  if (version.version === "v2_prompt") return "V2 evaluation";
  if (version.version === BASELINE_EVAL_VERSION) return "Baseline";
  return version.version;
}

function versionAnchor(version: VersionData) {
  if (version.version === FINAL_EVAL_VERSION) return "final-v3-evaluation";
  return `eval-${version.version.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
}

function promptLabel(version: VersionData) {
  if (version.version === FINAL_EVAL_VERSION) return "v3Pipeline";
  return version.summary.prompt_version;
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
  return { label: "Overall avg", value: summary.overall_avg ?? 0, max: 4, display: scorePercent(summary.overall_avg) };
}

function scoreTone(value: number, max: number) {
  const ratio = max ? value / max : 0;
  if (ratio >= 0.8) return "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]";
  if (ratio >= 0.6) return "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]";
  if (ratio >= 0.4) return "bg-[#fffbeb] text-[#b45309] border-[#fde68a]";
  return "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]";
}

function deltaTone(value: number, betterWhenHigher = true, surface: "light" | "dark" = "light") {
  if (Math.abs(value) < 0.0001) return surface === "dark" ? "text-[#d7d2cb]" : "text-[#6b6860]";
  const improved = betterWhenHigher ? value > 0 : value < 0;
  return improved ? "text-[#15803d]" : "text-[#b45309]";
}

function Bar({ value, max, tone = "bg-[#1B6AE7]" }: { value: number; max: number; tone?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#e4e0da]">
      <div className={`h-full rounded-full ${tone}`} style={{ width: metricWidth(value, max) }} />
    </div>
  );
}

function HeroMetrics({ version, previousVersion }: { version: VersionData; previousVersion?: VersionData }) {
  const { summary } = version;
  const factual = summary.scores.factual;
  const quality = summary.scores.quality;
  const skeptic = summary.scores.skeptic;
  const factualDelta = factual?.pass_rate !== undefined && previousVersion?.summary.scores.factual?.pass_rate !== undefined
    ? factual.pass_rate - previousVersion.summary.scores.factual.pass_rate
    : undefined;
  const qualityDelta = quality?.overall_avg !== undefined && previousVersion?.summary.scores.quality?.overall_avg !== undefined
    ? quality.overall_avg - previousVersion.summary.scores.quality.overall_avg
    : undefined;
  const skepticDelta =
    skeptic?.fit_level_accuracy !== undefined && previousVersion?.summary.scores.skeptic?.fit_level_accuracy !== undefined
      ? skeptic.fit_level_accuracy - previousVersion.summary.scores.skeptic.fit_level_accuracy
      : undefined;
  const latencyDelta = previousVersion
    ? summary.latency.overall.total_mean_ms - previousVersion.summary.latency.overall.total_mean_ms
    : undefined;

  return (
    <section className="grid gap-3 md:grid-cols-4">
      <MetricPanel
        label="Facts remembered"
        value={percent(factual?.pass_rate)}
        helper={`${factual?.n ?? 0} recall checks`}
        delta={factualDelta !== undefined ? signedPercentPoints(factualDelta) : undefined}
        deltaClass={factualDelta !== undefined ? deltaTone(factualDelta) : undefined}
      />
      <MetricPanel
        label="Answer quality"
        value={scorePercent(quality?.overall_avg)}
        helper="Specificity, evidence, grounding"
        delta={qualityDelta !== undefined ? signedScorePercentPoints(qualityDelta) : undefined}
        deltaClass={qualityDelta !== undefined ? deltaTone(qualityDelta) : undefined}
      />
      <MetricPanel
        label="Fit label accuracy"
        value={percent(skeptic?.fit_level_accuracy)}
        helper={`${skeptic?.n ?? 0} fit prompts`}
        delta={skepticDelta !== undefined ? signedPercentPoints(skepticDelta) : undefined}
        deltaClass={skepticDelta !== undefined ? deltaTone(skepticDelta) : undefined}
      />
      <MetricPanel
        label="Average wait"
        value={seconds(summary.latency.overall.total_mean_ms)}
        helper={`${summary.latency.overall.n} total cases`}
        delta={latencyDelta !== undefined ? signedSeconds(latencyDelta) : undefined}
        deltaClass={latencyDelta !== undefined ? deltaTone(latencyDelta, false) : undefined}
      />
    </section>
  );
}

function MetricPanel({
  label,
  value,
  helper,
  delta,
  deltaClass = "text-[#6b6860]",
}: {
  label: string;
  value: string;
  helper: string;
  delta?: string;
  deltaClass?: string;
}) {
  return (
    <div className="rounded-lg border border-[#e4e0da] bg-white px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#6b6860]">{label}</p>
        {delta ? <span className={`text-xs font-semibold ${deltaClass}`}>{delta}</span> : null}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111111]">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-[#6b6860]">{helper}</p>
    </div>
  );
}

function ReadoutHero({ version, previousVersion }: { version: VersionData; previousVersion?: VersionData }) {
  const factualPass = version.summary.scores.factual?.pass_rate ?? 0;
  const fitAccuracy = version.summary.scores.skeptic?.fit_level_accuracy ?? 0;
  const qualityScore = version.summary.scores.quality?.overall_avg ?? 0;
  const verdict =
    factualPass >= 1 && qualityScore >= 3.4 && fitAccuracy >= 0.5
      ? "Final V3 is more grounded, better calibrated, but slower."
      : "The agent needs more work before its fit judgments should be trusted.";

  return (
    <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="rounded-lg border border-[#e4e0da] bg-white p-6 md:p-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#1d4ed8]">
          <SearchCheck size={14} />
          Final V3 report
        </div>
        <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-[#111111] md:text-4xl">
          {verdict}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#34312c]">
          This page tests the hiring agent the way a recruiter would use it: ask factual questions, judge answer usefulness,
          and check whether fit labels stay conservative when the evidence is only adjacent.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <OutcomePill icon={<CheckCircle2 size={16} />} label="Facts" value={percent(factualPass)} helper="known-answer checks" />
          <OutcomePill icon={<ShieldCheck size={16} />} label="Quality" value={scorePercent(qualityScore)} helper="evidence rubric" />
          <OutcomePill icon={<Gauge size={16} />} label="Fit labels" value={percent(fitAccuracy)} helper="calibration checks" />
        </div>
      </div>
      <div className="rounded-lg border border-[#d8d1c7] bg-[#111111] p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#d7d2cb]">What changed</p>
        {previousVersion ? (
          <>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              Baseline <ArrowRight className="mx-1 inline-block" size={18} /> {FINAL_EVAL_LABEL}
            </p>
            <ChangeList current={version} previous={previousVersion} />
          </>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-[#d7d2cb]">
            Add a baseline eval version to see score and latency changes here.
          </p>
        )}
      </div>
    </section>
  );
}

function OutcomePill({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-lg border border-[#ede9e3] bg-[#faf9f6] p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#34312c]">
        <span className="text-[#1B6AE7]">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#111111]">{value}</p>
      <p className="mt-1 text-xs text-[#6b6860]">{helper}</p>
    </div>
  );
}

function ChangeList({ current, previous }: { current: VersionData; previous: VersionData }) {
  const factualDelta =
    (current.summary.scores.factual?.pass_rate ?? 0) - (previous.summary.scores.factual?.pass_rate ?? 0);
  const qualityDelta =
    (current.summary.scores.quality?.overall_avg ?? 0) - (previous.summary.scores.quality?.overall_avg ?? 0);
  const fitDelta =
    (current.summary.scores.skeptic?.fit_level_accuracy ?? 0) -
    (previous.summary.scores.skeptic?.fit_level_accuracy ?? 0);
  const latencyDelta = current.summary.latency.overall.total_mean_ms - previous.summary.latency.overall.total_mean_ms;

  return (
    <dl className="mt-6 space-y-4">
      <ChangeRow label="Factual recall" value={signedPercentPoints(factualDelta)} tone={deltaTone(factualDelta, true, "dark")} />
      <ChangeRow label="Answer quality" value={signedScorePercentPoints(qualityDelta)} tone={deltaTone(qualityDelta, true, "dark")} />
      <ChangeRow label="Fit accuracy" value={signedPercentPoints(fitDelta)} tone={deltaTone(fitDelta, true, "dark")} />
      <ChangeRow label="Average latency" value={signedSeconds(latencyDelta)} tone={deltaTone(latencyDelta, false, "dark")} />
    </dl>
  );
}

function ChangeRow({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-sm text-[#d7d2cb]">{label}</dt>
      <dd className={`text-sm font-semibold ${tone}`}>{value}</dd>
    </div>
  );
}

function HowToRead() {
  return (
    <section className="rounded-lg border border-[#e4e0da] bg-white p-5 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b6860]">How to read this</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111]">Three eval sets</h2>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-[#6b6860]">
          I ran the agent through factual recall, answer quality, and fit judgment evals. Together they test whether it
          remembers the profile, answers with evidence, and stays skeptical when the match is weak.
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ExplainerCard
          icon={<CheckCircle2 size={18} />}
          title={TEST_SET_LABELS.factual}
          text={TEST_SET_EXPLAINERS.factual.detail}
          accent="bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]"
        />
        <ExplainerCard
          icon={<ShieldCheck size={18} />}
          title={TEST_SET_LABELS.quality}
          text={TEST_SET_EXPLAINERS.quality.detail}
          accent="bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]"
        />
        <ExplainerCard
          icon={<TriangleAlert size={18} />}
          title={TEST_SET_LABELS.skeptic}
          text={TEST_SET_EXPLAINERS.skeptic.detail}
          accent="bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
        />
      </div>
    </section>
  );
}

function ExplainerCard({
  icon,
  title,
  text,
  accent,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-[#ede9e3] bg-[#faf9f6] p-4">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${accent}`}>{icon}</div>
      <h3 className="mt-4 text-base font-semibold text-[#111111]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6b6860]">{text}</p>
    </div>
  );
}

function ScoreGrid({ version, isFinal = false }: { version: VersionData; isFinal?: boolean }) {
  return (
    <section className="rounded-lg border border-[#e4e0da] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b6860]">Scorecard</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111]">
            {isFinal ? "Where V3 is strong or weak" : "Where this run was strong or weak"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6b6860]">
            Green is healthy, amber is watch closely, red needs work. Quality and fit judgment use a 1-4 judge rubric.
          </p>
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
              <p className="mt-2 text-xs text-[#6b6860]">{TEST_SET_EXPLAINERS[testSet].short}</p>
              <p className="mt-1 text-xs text-[#8a857c]">{metric.label}</p>
              <div className="mt-4">
                <Bar value={metric.value} max={metric.max} />
              </div>
              {testSet !== "factual" && version.summary.scores[testSet] ? (
                <div className="mt-4 space-y-2 text-xs text-[#6b6860]">
                  {testSet === "skeptic" ? (
                    <>
                      <ScoreLine
                        label="Alignment"
                        value={
                          version.summary.scores[testSet]?.target_alignment_avg ??
                          version.summary.scores[testSet]?.specificity_avg
                        }
                      />
                      <ScoreLine label="Calibration" value={version.summary.scores[testSet]?.fit_calibration_avg} />
                    </>
                  ) : (
                    <ScoreLine label="Specificity" value={version.summary.scores[testSet]?.specificity_avg} />
                  )}
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

function LatencyGrid({ version, isFinal = false }: { version: VersionData; isFinal?: boolean }) {
  return (
    <section className="rounded-lg border border-[#e4e0da] bg-white p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b6860]">Responsiveness</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111]">
            {isFinal ? "The speed tradeoff" : "How long this run took"}
          </h2>
        </div>
        <p className="max-w-lg text-sm leading-relaxed text-[#6b6860]">
          {isFinal
            ? "V3 is slower because it plans intent, classifies evidence, and sometimes researches company context before answering. URL or web-search paths naturally take longer than profile-only questions."
            : "Latency is measured from the offline run. URL or web-search paths naturally take longer than profile-only questions."}
        </p>
      </div>
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
  const alignment = skeptic.target_alignment ?? skeptic.specificity ?? 0;
  const calibration = skeptic.fit_calibration ?? 0;
  return `Expected ${skeptic.expected_fit_level}; got ${skeptic.actual_fit_level}. Alignment ${alignment}/4 · Calibration ${calibration}/4 · Evidence ${skeptic.evidence_citation}/4 · Grounding ${skeptic.anti_hallucination}/4. ${skeptic.reasoning}`;
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
          <h2 className="text-lg font-semibold text-[#111111]">What still needs attention</h2>
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

function VersionSection({
  version,
  previousVersion,
  isFinal = false,
}: {
  version: VersionData;
  previousVersion?: VersionData;
  isFinal?: boolean;
}) {
  return (
    <section id={versionAnchor(version)} className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-[#e4e0da] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b6860]">Evaluation report</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-[#111111]">{versionLabel(version)}</h1>
          <p className="mt-2 text-sm text-[#6b6860]">
            Captured {formatDate(version.summary.date)}
            {promptLabel(version) ? ` · Prompt ${promptLabel(version)}` : ""}
            {version.summary.profile_version ? ` · Profile ${version.summary.profile_version}` : ""}
            {" · "}
            SHA {version.summary.system_prompt_sha.slice(0, 7)}
          </p>
        </div>
        <Link
          href="/chat"
          className="inline-flex w-fit items-center rounded-full border border-[#e4e0da] bg-white px-4 py-2 text-sm font-medium text-[#34312c] transition-colors hover:border-[#cfc8be] hover:bg-[#faf9f6]"
        >
          Try the agent
        </Link>
      </div>
      <HeroMetrics version={version} previousVersion={previousVersion} />
      <ScoreGrid version={version} isFinal={isFinal} />
      <LatencyGrid version={version} isFinal={isFinal} />
      <CaseInspection version={version} />
    </section>
  );
}

export default function EvalsPage() {
  const availableVersions = discoverVersions();
  const finalVersion = availableVersions.includes(FINAL_EVAL_VERSION) ? loadVersion(FINAL_EVAL_VERSION) : null;
  const baselineVersion = availableVersions.includes(BASELINE_EVAL_VERSION) ? loadVersion(BASELINE_EVAL_VERSION) : undefined;
  const comparisonVersions = COMPARISON_EVAL_VERSIONS.filter((version) => availableVersions.includes(version)).map(loadVersion);
  const historyVersions = comparisonVersions.filter((version) => version.version !== FINAL_EVAL_VERSION);

  return (
    <>
      <Nav sectionHrefPrefix="/" />
      <main className="min-h-screen bg-[#F5F3EF] px-6 pt-24 pb-16 text-[#111111] md:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1B6AE7]">Agent evals</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#111111] md:text-5xl">
              Can this hiring agent be trusted?
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#34312c] md:text-lg">
              The final V3 report on whether the agent remembers facts, gives evidence-backed answers, and stays skeptical
              when a role is not a clean fit.
            </p>
          </header>

          {finalVersion ? (
            <div className="mb-8 space-y-5">
              <ReadoutHero version={finalVersion} previousVersion={baselineVersion} />
              <HowToRead />
            </div>
          ) : null}

          {finalVersion ? (
            <div className="space-y-12">
              <VersionSection version={finalVersion} previousVersion={baselineVersion} isFinal />
              {historyVersions.length ? (
                <section className="space-y-6">
                  <div className="border-b border-[#e4e0da] pb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b6860]">Comparison history</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#111111]">
                      How V3 compares with V1 and V2
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#6b6860]">
                      These earlier runs stay visible for context. The final V3 report above is the version to judge as current.
                    </p>
                  </div>
                  {historyVersions.map((version) => (
                    <VersionSection
                      key={version.version}
                      version={version}
                      previousVersion={version.version === BASELINE_EVAL_VERSION ? undefined : baselineVersion}
                    />
                  ))}
                </section>
              ) : null}
            </div>
          ) : (
            <section className="rounded-lg border border-[#e4e0da] bg-white p-6">
              <h2 className="text-xl font-semibold text-[#111111]">No final V3 eval run yet</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6b6860]">
                Run the final V3 eval suite, then judge and compare the version to populate this page.
              </p>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
