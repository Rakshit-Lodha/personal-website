import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Code2,
  Database,
  FileQuestion,
  Gauge,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import Nav from "@/components/Nav";

export const dynamic = "force-dynamic";

type TestSet = "factual" | "quality" | "skeptic";

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
  };
};

type VersionData = {
  version: string;
  summary: EvalSummary;
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

function loadVersion(version: string): VersionData | null {
  const summary = readJson<EvalSummary>(evalPath("summaries", `${version}_summary.json`));
  return summary ? { version, summary } : null;
}

function loadVersions() {
  return discoverVersions().map(loadVersion).filter((version): version is VersionData => version !== null);
}

type ComparisonVersion = { key: string; label: string; color: string; data: VersionData };

const COMPARISON_META: { key: string; label: string; color: string }[] = [
  { key: "v1", label: "V1", color: "#9ca3af" },
  { key: "v2_prompt", label: "V2", color: "#1B6AE7" },
  { key: "v3Pipeline_tightened", label: "V3", color: "#15803d" },
];

function loadComparisonVersions(): ComparisonVersion[] {
  return COMPARISON_META.flatMap(({ key, label, color }) => {
    const data = loadVersion(key);
    return data ? [{ key, label, color, data }] : [];
  });
}

function percent(value: number | undefined) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

function score(value: number | undefined) {
  return `${(value ?? 0).toFixed(1)}/4`;
}

function seconds(ms: number | undefined) {
  return `${(((ms ?? 0) / 1000) || 0).toFixed(1)}s`;
}

function signedNumber(value: number, digits = 1) {
  const rounded = value.toFixed(digits);
  return value > 0 ? `+${rounded}` : rounded;
}

function signedPercentPoints(value: number) {
  const points = Math.round(value * 100);
  return points > 0 ? `+${points}pp` : `${points}pp`;
}

function signedSeconds(value: number) {
  const secondsValue = value / 1000;
  return secondsValue > 0 ? `+${secondsValue.toFixed(1)}s` : `${secondsValue.toFixed(1)}s`;
}

function getCurrentAndBaseline() {
  const versions = loadVersions();
  const current = versions[0];
  const baseline = versions.find((version) => version.version === "v1") ?? versions[versions.length - 1];

  return { current, baseline };
}

function deltaTone(value: number, betterWhenHigher = true) {
  if (Math.abs(value) < 0.0001) return "text-[#6b6860]";
  const improved = betterWhenHigher ? value > 0 : value < 0;
  return improved ? "text-[#15803d]" : "text-[#b45309]";
}

function comparisonRows(current: VersionData, baseline: VersionData) {
  const currentSummary = current.summary;
  const baselineSummary = baseline.summary;

  return [
    {
      label: "Factual recall",
      baseline: percent(baselineSummary.scores.factual?.pass_rate),
      current: percent(currentSummary.scores.factual?.pass_rate),
      change: signedPercentPoints(
        (currentSummary.scores.factual?.pass_rate ?? 0) - (baselineSummary.scores.factual?.pass_rate ?? 0),
      ),
      tone: deltaTone((currentSummary.scores.factual?.pass_rate ?? 0) - (baselineSummary.scores.factual?.pass_rate ?? 0)),
    },
    {
      label: "Answer quality",
      baseline: score(baselineSummary.scores.quality?.overall_avg),
      current: score(currentSummary.scores.quality?.overall_avg),
      change: signedNumber(
        (currentSummary.scores.quality?.overall_avg ?? 0) - (baselineSummary.scores.quality?.overall_avg ?? 0),
      ),
      tone: deltaTone((currentSummary.scores.quality?.overall_avg ?? 0) - (baselineSummary.scores.quality?.overall_avg ?? 0)),
    },
    {
      label: "Fit accuracy",
      baseline: percent(baselineSummary.scores.skeptic?.fit_level_accuracy),
      current: percent(currentSummary.scores.skeptic?.fit_level_accuracy),
      change: signedPercentPoints(
        (currentSummary.scores.skeptic?.fit_level_accuracy ?? 0) -
          (baselineSummary.scores.skeptic?.fit_level_accuracy ?? 0),
      ),
      tone: deltaTone(
        (currentSummary.scores.skeptic?.fit_level_accuracy ?? 0) -
          (baselineSummary.scores.skeptic?.fit_level_accuracy ?? 0),
      ),
    },
    {
      label: "Latency",
      baseline: seconds(baselineSummary.latency.overall.total_mean_ms),
      current: seconds(currentSummary.latency.overall.total_mean_ms),
      change: signedSeconds(
        currentSummary.latency.overall.total_mean_ms - baselineSummary.latency.overall.total_mean_ms,
      ),
      tone: deltaTone(
        currentSummary.latency.overall.total_mean_ms - baselineSummary.latency.overall.total_mean_ms,
        false,
      ),
    },
  ];
}

function StatCard({ label, value, helper, tone }: { label: string; value: string; helper: string; tone: string }) {
  return (
    <div className="rounded-lg border border-[#e4e0da] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b6860]">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-[#111111]">{value}</p>
      <p className={`mt-2 text-sm leading-relaxed ${tone}`}>{helper}</p>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1B6AE7]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#111111] md:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-relaxed text-[#34312c]">{body}</p>
    </div>
  );
}

function MiniPromptCard({
  question,
  should,
  mode,
}: {
  question: string;
  should: string;
  mode: "Ask" | "Fit";
}) {
  return (
    <div className="rounded-lg border border-[#ede9e3] bg-[#faf9f6] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b6860]">Visitor asks</p>
        <span className="rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2 py-1 text-xs font-semibold text-[#1d4ed8]">
          {mode} mode
        </span>
      </div>
      <p className="mt-3 text-lg font-semibold leading-snug text-[#111111]">{question}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#6b6860]">Agent should</p>
      <p className="mt-2 text-sm leading-relaxed text-[#34312c]">{should}</p>
    </div>
  );
}

function PipelineStep({
  icon,
  title,
  body,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  badge?: string;
}) {
  return (
    <div className="relative rounded-lg border border-[#e4e0da] bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]">
          {icon}
        </div>
        {badge && (
          <span className="rounded-full border border-[#e4e0da] bg-[#faf9f6] px-2 py-0.5 text-xs font-semibold text-[#6b6860]">
            {badge}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-base font-semibold text-[#111111]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6b6860]">{body}</p>
    </div>
  );
}

function EvalCard({
  icon,
  title,
  question,
  result,
  catches,
}: {
  icon: React.ReactNode;
  title: string;
  question: string;
  result: string;
  catches: string;
}) {
  return (
    <div className="rounded-lg border border-[#e4e0da] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4e0da] bg-[#faf9f6] text-[#1B6AE7]">
          {icon}
        </div>
        <span className="rounded-full border border-[#e4e0da] bg-[#faf9f6] px-3 py-1 text-sm font-semibold text-[#111111]">
          {result}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-[#111111]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#34312c]">{question}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#6b6860]">What it catches</p>
      <p className="mt-2 text-sm leading-relaxed text-[#6b6860]">{catches}</p>
    </div>
  );
}

function VersionBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#f0ece6]">
      <div className="h-2.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

type BarEntry = { vLabel: string; value: number; max: number; color: string; display: string };

function MetricRow({ label, entries }: { label: string; entries: BarEntry[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#34312c]">{label}</p>
      <div className="mt-2 space-y-2">
        {entries.map((e) => (
          <div key={e.vLabel} className="flex items-center gap-2.5">
            <span className="w-5 shrink-0 text-right text-[10px] font-bold text-[#9ca3af]">{e.vLabel}</span>
            <VersionBar value={e.value} max={e.max} color={e.color} />
            <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-[#111111]">{e.display}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartGroup({ title, metrics }: { title: string; metrics: { label: string; entries: BarEntry[] }[] }) {
  return (
    <div className="space-y-6 rounded-lg border border-[#e4e0da] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b6860]">{title}</p>
      {metrics.map((m) => (
        <MetricRow key={m.label} label={m.label} entries={m.entries} />
      ))}
    </div>
  );
}

function buildChartGroups(versions: ComparisonVersion[]) {
  function scoreEntries(key: keyof NonNullable<EvalSummary["scores"]["quality"]>) {
    return versions.map(({ label, color, data }) => ({
      vLabel: label,
      value: data.summary.scores.quality?.[key as string] ?? 0,
      max: 4,
      color,
      display: (data.summary.scores.quality?.[key as string] ?? 0).toFixed(1),
    }));
  }

  function skepticEntries(key: string) {
    return versions.map(({ label, color, data }) => ({
      vLabel: label,
      value: data.summary.scores.skeptic?.[key] ?? 0,
      max: key === "fit_level_accuracy" ? 1 : 4,
      color,
      display:
        key === "fit_level_accuracy"
          ? `${Math.round((data.summary.scores.skeptic?.[key] ?? 0) * 100)}%`
          : (data.summary.scores.skeptic?.[key] ?? 0).toFixed(1),
    }));
  }

  const factual = [
    {
      label: "Pass rate",
      entries: versions.map(({ label, color, data }) => ({
        vLabel: label,
        value: data.summary.scores.factual?.pass_rate ?? 0,
        max: 1,
        color,
        display: `${Math.round((data.summary.scores.factual?.pass_rate ?? 0) * 100)}%`,
      })),
    },
  ];

  const quality = [
    { label: "Specificity", entries: scoreEntries("specificity_avg") },
    { label: "Evidence citation", entries: scoreEntries("evidence_citation_avg") },
    { label: "Anti-hallucination", entries: scoreEntries("anti_hallucination_avg") },
    { label: "Overall", entries: scoreEntries("overall_avg") },
  ];

  const fitment = [
    { label: "Fit level accuracy", entries: skepticEntries("fit_level_accuracy") },
    { label: "Target alignment", entries: skepticEntries("target_alignment_avg") },
    { label: "Fit calibration", entries: skepticEntries("fit_calibration_avg") },
    { label: "Evidence citation", entries: skepticEntries("evidence_citation_avg") },
    { label: "Anti-hallucination", entries: skepticEntries("anti_hallucination_avg") },
    { label: "Overall", entries: skepticEntries("overall_avg") },
  ];

  return { factual, quality, fitment };
}

export default function EvalV2Page() {
  const { current, baseline } = getCurrentAndBaseline();
  const comparisonVersions = loadComparisonVersions();
  const charts = comparisonVersions.length >= 2 ? buildChartGroups(comparisonVersions) : null;

  if (!current || !baseline) {
    return (
      <>
        <Nav sectionHrefPrefix="/" />
        <main className="min-h-screen bg-[#F5F3EF] px-6 pt-24 pb-16 text-[#111111] md:px-8">
          <section className="mx-auto max-w-3xl rounded-lg border border-[#e4e0da] bg-white p-6">
            <h1 className="text-3xl font-semibold tracking-tight">No eval data found</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#6b6860]">
              Generate eval summaries first, then this explainer can render the current results.
            </p>
          </section>
        </main>
      </>
    );
  }

  const currentScores = current.summary.scores;
  const rows = comparisonRows(current, baseline);

  return (
    <>
      <Nav sectionHrefPrefix="/" />
      <main className="min-h-screen bg-[#F5F3EF] px-6 pt-24 pb-16 text-[#111111] md:px-8">
        <article className="mx-auto max-w-6xl space-y-16">
          <header className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-[#111111] md:text-6xl">
                How the AI hiring agent works and should you trust it?
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#34312c]">
                I built a chat agent for my personal website so people can ask about my work, projects, and role fit.
                This is how the V3 pipeline works under the hood, what changed from V1 and V2, and how I test whether it should be trusted.
              </p>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Factual recall"
              value={percent(currentScores.factual?.pass_rate)}
              helper="Known profile facts answered correctly"
              tone="text-[#15803d]"
            />
            <StatCard
              label="Answer quality"
              value={score(currentScores.quality?.overall_avg)}
              helper="Specificity, evidence, and grounding"
              tone="text-[#1d4ed8]"
            />
            <StatCard
              label="Fit calibration"
              value={percent(currentScores.skeptic?.fit_level_accuracy)}
              helper="Improved from 42% in V1 — still the hardest part"
              tone="text-[#b45309]"
            />
          </section>

          <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <SectionIntro
              eyebrow="What the agent does"
              title="The product problem is not chat. It is representation."
              body="A hiring agent speaks on my behalf. That means it has to separate factual Q&A from role-fit evaluation, avoid generic resume language, and admit when the profile does not prove something."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <MiniPromptCard
                question="Has Rakshit worked on LLM evals?"
                should="Lead with ET Money support automation eval pipeline. Use personal projects only as supporting depth."
                mode="Ask"
              />
              <MiniPromptCard
                question="Is Rakshit a fit for this ML Engineer role?"
                should="Map hard ML engineering requirements against profile evidence, call out missing depth, and avoid over-selling adjacent AI product work."
                mode="Fit"
              />
            </div>
          </section>

          <section className="space-y-6">
            <SectionIntro
              eyebrow="V3 pipeline"
              title="Four dedicated stages instead of one."
              body="V1 established the baseline agent behavior. V2 improved prompt and profile grounding. V3 turns the system into a versioned pipeline: plan intent, optionally research the company, classify evidence, route to the right answer agent, and stream a structured response. The key insight is that evidence classification needs its own step — you can't rank production outcomes above side projects if you don't know which is which yet."
            />
            <div className="flex justify-center rounded-xl border border-[#e4e0da] bg-white p-6">
              <Image
                src="/v3-pipeline-flowchart.png"
                alt="V3 agent pipeline flowchart"
                width={920}
                height={1380}
                className="w-full max-w-2xl"
              />
            </div>
          </section>


          <section className="space-y-6">
            <SectionIntro
              eyebrow="Factuality"
              title="How the agent gets facts right"
              body="The central rule is simple: answer from evidence, not vibes. The system is designed so that missing evidence is an acceptable answer, not a failure to be hidden."
            />
            <div className="grid gap-4 md:grid-cols-3">
              <PipelineStep
                icon={<Database size={18} />}
                title="Structured profile data"
                body="Experience, projects, outcomes, tools, preferences, caveats, and deeper project notes live as typed profile data with production outcome metrics."
              />
              <PipelineStep
                icon={<Code2 size={18} />}
                title="Evidence classification"
                body="Every piece of retrieved evidence is labelled with workContext (production / personal_project / generic) and evidenceStrength before the answer is written."
              />
              <PipelineStep
                icon={<FileQuestion size={18} />}
                title="Missing evidence allowed"
                body="The agent can say the profile does not show something. That prevents plausible but unsupported claims. Gaps are a first-class field in the evidence packet."
              />
            </div>
          </section>

          <section className="space-y-6">
            <SectionIntro
              eyebrow="Eval suite"
              title="I test the agent across three failure modes."
              body="The evals are split by product behavior: remembering profile facts, giving useful evidence-backed answers, and calibrating fit without turning every role into a pitch."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <EvalCard
                icon={<CheckCircle2 size={18} />}
                title="Factual recall"
                question="Can it answer known profile facts correctly?"
                result={percent(currentScores.factual?.pass_rate)}
                catches="Wrong dates, wrong metrics, invented projects, and missed profile facts."
              />
              <EvalCard
                icon={<MessageSquareText size={18} />}
                title="Answer quality"
                question="Are answers specific, useful, and evidence-backed?"
                result={score(currentScores.quality?.overall_avg)}
                catches="Generic resume-speak, weak evidence, vague claims, and personal projects used in place of professional evidence."
              />
              <EvalCard
                icon={<Gauge size={18} />}
                title="Fit judgment"
                question="Can it avoid over-selling role fit?"
                result={percent(currentScores.skeptic?.fit_level_accuracy)}
                catches="Adjacent experience being treated as direct evidence, and hard gaps being underweighted."
              />
            </div>
          </section>

          {charts && (
            <section className="space-y-6">
              <SectionIntro
                eyebrow="Version comparison"
                title="V1 → V2 → V3 across all dimensions."
                body="Each bar shows how the three pipeline generations compare on every scored dimension. Grey = V1, blue = V2, green = V3. Quality scores are on a 1–4 scale; fit level accuracy is a percentage."
              />
              <div className="grid gap-5 lg:grid-cols-3">
                <ChartGroup title="Factual" metrics={charts.factual} />
                <ChartGroup title="Quality (1–4 scale)" metrics={charts.quality} />
                <ChartGroup title="Fitment" metrics={charts.fitment} />
              </div>
            </section>
          )}

          <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <SectionIntro
              eyebrow="V1 baseline vs V3"
              title="V3 improves trust, with a latency tradeoff."
              body="The current V3 pipeline beats the V1 baseline on answer quality and fit accuracy while preserving factual recall. It is slower because the system now plans intent, researches company context when needed, and classifies evidence before writing."
            />
            <div className="overflow-hidden rounded-lg border border-[#e4e0da] bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#faf9f6] text-xs uppercase tracking-[0.12em] text-[#6b6860]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Metric</th>
                    <th className="px-4 py-3 font-semibold">{baseline.version} (baseline)</th>
                    <th className="px-4 py-3 font-semibold">V3 (current)</th>
                    <th className="px-4 py-3 font-semibold">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label} className="border-t border-[#ede9e3]">
                      <td className="px-4 py-4 font-medium text-[#111111]">{row.label}</td>
                      <td className="px-4 py-4 text-[#6b6860]">{row.baseline}</td>
                      <td className="px-4 py-4 text-[#34312c]">{row.current}</td>
                      <td className={`px-4 py-4 font-semibold ${row.tone}`}>{row.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>




          <footer className="rounded-lg border border-[#d8d1c7] bg-[#111111] p-8 text-white">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-[#d7d2cb]">
                  <Sparkles size={18} />
                  <p className="text-xs font-semibold uppercase tracking-[0.14em]">Closing thought</p>
                </div>
                <p className="mt-4 text-3xl font-semibold leading-tight">
                  The goal is not to make the agent sound impressive. The goal is to make it honest.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/chat" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#111111]">
                  Try the agent
                </Link>
                <Link
                  href="/#projects"
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white"
                >
                  View projects
                </Link>
              </div>
            </div>
          </footer>
        </article>
      </main>
    </>
  );
}
