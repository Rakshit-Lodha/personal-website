import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { CaseResult, FactualScore, QualityScore, RunFile, ScoreFile, SkepticScore, TestSet } from "../types";
import { serializeProfileSections } from "@/lib/agent/profileContext";

const profileSummary = serializeProfileSections();

loadEnvConfig(process.cwd());

const TEST_SETS: TestSet[] = ["factual", "quality", "skeptic"];
const JUDGE_MODEL = "claude-sonnet-4-5";
const JUDGE_DELAY_MS = 1000;

type AnthropicTextBlock = {
  type: "text";
  text: string;
};

function usage(): never {
  console.error("Usage: npx tsx src/lib/eval/scripts/judge.ts <version> <factual|quality|skeptic>");
  process.exit(1);
}

function parseArgs() {
  const [, , version, testSetArg] = process.argv;
  if (!version || !testSetArg) usage();

  if (!TEST_SETS.includes(testSetArg as TestSet)) {
    console.error(`Invalid test set: ${testSetArg}. Expected one of: ${TEST_SETS.join(", ")}`);
    process.exit(1);
  }

  return { version, testSet: testSetArg as TestSet };
}

function repoPath(...segments: string[]) {
  return path.join(process.cwd(), ...segments);
}

async function readJsonFile<T>(filePath: string) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clampScore(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 1;
  return Math.min(4, Math.max(1, Math.round(numeric)));
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function stripJsonFences(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractJudgeText(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("content" in payload)) {
    throw new Error("Anthropic response missing content");
  }

  const content = (payload as { content: unknown }).content;
  if (!Array.isArray(content)) throw new Error("Anthropic response content is not an array");

  return content
    .filter((block): block is AnthropicTextBlock => {
      return Boolean(
        block &&
          typeof block === "object" &&
          (block as { type?: unknown }).type === "text" &&
          typeof (block as { text?: unknown }).text === "string",
      );
    })
    .map((block) => block.text)
    .join("\n")
    .trim();
}

async function callJudge(prompt: string, apiKey: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: JUDGE_MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`judge request failed: HTTP ${response.status} ${text.slice(0, 300)}`);
  }

  const payload = (await response.json()) as unknown;
  return JSON.parse(stripJsonFences(extractJudgeText(payload))) as Record<string, unknown>;
}

function factualPrompt(testCase: CaseResult) {
  return `You are scoring an AI agent's response to a factual question.

QUESTION: ${testCase.question}

GROUND TRUTH: ${testCase.expected ?? ""}

AGENT'S RESPONSE: ${testCase.answer_text}

Determine whether the agent's response correctly conveys the ground truth fact. Minor wording differences are fine. Numerical or temporal precision must match — "around ₹80Cr" does NOT pass for "₹100Cr". The agent passes if the ground truth fact is clearly present in the response, even amid additional content.

Respond with ONLY a JSON object, no other text:
{"pass": true|false, "reasoning": "one sentence explanation"}`;
}

function qualityPrompt(testCase: CaseResult, profileSummary: string) {
  return `You are a STRICT evaluator scoring an AI agent's response to a question about Rakshit Lodha (an AI Product Manager). Your goal is to identify actual quality, not to be encouraging. Do not inflate scores to give partial credit.

PROFILE GROUND TRUTH:
${profileSummary}

QUESTION: ${testCase.question}

AGENT'S RESPONSE: ${testCase.answer_text}

SCORING RULES:
- The 1-4 scale is a real distribution. Most professional responses score 2-3. A score of 4 is exemplary and rare.
- Cross-check every specific claim in the response against the PROFILE GROUND TRUTH above. Claims not supported by the profile are hallucinations, regardless of how plausible they sound.
- Hedge words ('likely', 'probably', 'would', 'appears to', 'suggests that') do NOT protect against hallucination. They are INDICATORS that the agent is speculating without evidence. When evidence is missing, the correct behavior is to say "the profile does not cover this" — NOT to speculate.

DIMENSIONS (score each 1-4):

1. SPECIFICITY: Does the response name specific projects, roles, metrics, and shipped outcomes?
   - 4: Every capability claim is paired with a named project, role, or outcome. No generic capability-words.
   - 3: Most claims are specific. 1-2 claims are vague or under-specified.
   - 2: Half the response is specific, half is generic capability-soup.
   - 1: Entirely generic. No named projects, no metrics, no shipped outcomes.

2. EVIDENCE-CITATION: Is each capability claim tied to verifiable profile evidence?
   - 4: Every claim points to a specific profile section, project, or outcome that supports it.
   - 3: Most claims are supported. 1-2 claims are asserted without clear profile backing.
   - 2: Several claims are unsupported by profile evidence. The response would not hold up to scrutiny.
   - 1: Claims are listed without any evidence pointers. Profile data is not meaningfully cited.

3. ANTI-HALLUCINATION: Does the response avoid inventing claims or stretching evidence?
   - 4: Strictly grounded in profile data. Admits limits where evidence is thin.
   - 3: Mostly grounded. Minor interpretive stretches but no fabrication.
   - 2: Contains hedged speculation ('likely', 'would', 'appears to') in place of grounded claims. The agent should have admitted missing evidence instead.
   - 1: Contains clear fabrication, invented quotes, conflated entities, or claims that contradict the profile.

CRITICAL FAILURE OVERRIDE: If anti-hallucination scores 1, set "critical_failure": true. Critical failures are worse than vague responses because specific fabricated claims give readers false confidence.

Respond with ONLY a JSON object, no other text:
{"specificity": <1-4>, "evidence_citation": <1-4>, "anti_hallucination": <1-4>, "critical_failure": <true|false>, "reasoning": "3-4 sentences with specific citations to which claims in the response are grounded vs ungrounded"}`;
}

function parseExpectedFitLevel(expectedFit: string | null) {
  const allowed = ["Strong fit", "Relevant fit", "Partial fit", "Not enough evidence"];
  if (!expectedFit) return "Not enough evidence";

  const normalized = expectedFit.replace(/\s+/g, " ").trim().toLowerCase();
  const match = allowed.find((level) => normalized.startsWith(level.toLowerCase()));
  if (match) return match;
  if (normalized.startsWith("not a fit")) return "Not enough evidence";
  return expectedFit.split(/\s+[—-]\s+/)[0]?.trim() || expectedFit;
}

function getActualFitLevel(testCase: CaseResult) {
  const fitLevel = testCase.response?.fitLevel;
  return typeof fitLevel === "string" && fitLevel.trim() ? fitLevel.trim() : "Not enough evidence";
}

function skepticPrompt(testCase: CaseResult, expectedFitLevel: string, actualFitLevel: string) {
  return `You are scoring an AI agent's fit assessment of Rakshit Lodha against a hiring target.

The agent must classify fit as exactly one of:
- "Strong fit"
- "Relevant fit"
- "Partial fit"
- "Not enough evidence"

Your job is not just to check whether the answer is detailed.
Your job is to check whether the agent correctly weighted Rakshit's evidence against the evaluation target.

The evaluation target may be:
- a full job description,
- a short role/scenario,
- a company website or company name,
- or a vague fit question.

If the target is a job description, identify the role's core must-have requirements.
If the target is a company or website, identify the company's concrete product/domain/business signals from the scenario and the agent's cited sources.
If the target is vague or public evidence is thin, the agent should be cautious and should not infer hiring needs, tech stack, seniority, or role requirements without evidence.

SCENARIO: ${testCase.question}

EXPECTED FIT: ${testCase.expected ?? ""}
EXPECTED FIT LEVEL (parsed): ${expectedFitLevel}
AGENT'S FIT LEVEL: ${actualFitLevel}
AGENT'S FULL EXPLANATION: ${testCase.answer_text}

First, identify the 3-6 most important evaluation criteria for this case.
For a JD, these are must-have role requirements.
For a company/website, these are public product/domain/business signals that matter for fit.
For a vague prompt, these may be unknowns or evidence gaps rather than requirements.

Then score:
1. fit_level_correct: did the agent's fit level match the expected? (true|false)
2. target_alignment (1-4): did the agent evaluate Rakshit against the right criteria for this target?
   4 = clearly maps strengths and gaps against the core target criteria.
   3 = covers most core criteria, with some missing weighting.
   2 = discusses some relevant evidence but misses or underweights major criteria.
   1 = mostly talks about impressive but non-core evidence.
3. fit_calibration (1-4): did the agent choose a fit label that properly reflects hard gaps and available evidence?
   4 = fit label is well-calibrated to the target criteria and gaps.
   3 = mostly calibrated, with minor generosity or harshness.
   2 = noticeably too generous or too harsh.
   1 = materially wrong label given the target.
4. evidence_citation (1-4): are claims about Rakshit tied to specific projects, roles, outcomes, or known profile facts?
   4 = every major claim has concrete evidence.
   3 = most claims are evidenced.
   2 = some claims are evidenced, but several are generic.
   1 = claims are mostly unsupported.
5. anti_hallucination (1-4): does the agent avoid inventing experience, overstating adjacent experience, or implying direct experience where only adjacent evidence exists?
   4 = strictly grounded and clearly distinguishes direct vs adjacent evidence.
   3 = mostly grounded with minor overreach.
   2 = some unsupported stretching.
   1 = clear fabrication or major overclaim.

Important judging rule:
A response can be detailed and evidence-backed while still being a bad fit assessment if it overweights adjacent evidence and underweights hard gaps. In that case, evidence_citation may be high, but target_alignment and fit_calibration should be low.

Examples:
- If a role requires PhD/Master's ML depth, Spark/PySpark, PyTorch/TensorFlow, model optimization, MLOps, and production ML engineering, then general GenAI product work or agent prototypes should not justify "Relevant fit" unless there is direct evidence for the core ML engineering requirements.
- If the prompt is only a company website, the agent should cite public company signals and avoid pretending there is a specific open role unless evidence supports that.
- Missing hard requirements should pull the fit level down, even if the candidate has impressive adjacent AI product experience.

Respond with ONLY a JSON object, no markdown, no code fence:
{"fit_level_correct": true|false, "expected_fit_level": "...", "actual_fit_level": "...", "core_criteria": ["...", "..."], "matched_criteria": ["...", "..."], "missing_or_weak_criteria": ["...", "..."], "target_alignment": <1-4>, "fit_calibration": <1-4>, "evidence_citation": <1-4>, "anti_hallucination": <1-4>, "reasoning": "2-4 sentences explaining whether the agent correctly weighted the target criteria and candidate evidence."}`;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function placeholderScore(testSet: TestSet, testCase: CaseResult, reason: string) {
  if (testSet === "factual") {
    return { id: testCase.id, pass: false, reasoning: reason } satisfies FactualScore;
  }

  if (testSet === "quality") {
    return {
      id: testCase.id,
      specificity: 1,
      evidence_citation: 1,
      anti_hallucination: 1,
      reasoning: reason,
    } satisfies QualityScore;
  }

  return {
    id: testCase.id,
    fit_level_correct: false,
    expected_fit_level: parseExpectedFitLevel(testCase.expected),
    actual_fit_level: getActualFitLevel(testCase),
    core_criteria: [],
    matched_criteria: [],
    missing_or_weak_criteria: [],
    target_alignment: 1,
    fit_calibration: 1,
    evidence_citation: 1,
    anti_hallucination: 1,
    reasoning: reason,
  } satisfies SkepticScore;
}

async function judgeCase(testSet: TestSet, testCase: CaseResult, apiKey: string) {
  if (testCase.error) {
    return placeholderScore(testSet, testCase, `skipped due to run error: ${testCase.error}`);
  }

  try {
    if (testSet === "factual") {
      const parsed = await callJudge(factualPrompt(testCase), apiKey);
      return {
        id: testCase.id,
        pass: parsed.pass === true,
        reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "No reasoning returned.",
      } satisfies FactualScore;
    }

    if (testSet === "quality") {
      const parsed = await callJudge(qualityPrompt(testCase, profileSummary), apiKey);
      return {
        id: testCase.id,
        specificity: clampScore(parsed.specificity),
        evidence_citation: clampScore(parsed.evidence_citation),
        anti_hallucination: clampScore(parsed.anti_hallucination),
        reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "No reasoning returned.",
      } satisfies QualityScore;
    }

    const expectedFitLevel = parseExpectedFitLevel(testCase.expected);
    const actualFitLevel = getActualFitLevel(testCase);
    const parsed = await callJudge(skepticPrompt(testCase, expectedFitLevel, actualFitLevel), apiKey);
    return {
      id: testCase.id,
      fit_level_correct: parsed.fit_level_correct === true,
      expected_fit_level: typeof parsed.expected_fit_level === "string" ? parsed.expected_fit_level : expectedFitLevel,
      actual_fit_level: typeof parsed.actual_fit_level === "string" ? parsed.actual_fit_level : actualFitLevel,
      core_criteria: stringArray(parsed.core_criteria),
      matched_criteria: stringArray(parsed.matched_criteria),
      missing_or_weak_criteria: stringArray(parsed.missing_or_weak_criteria),
      target_alignment: clampScore(parsed.target_alignment),
      fit_calibration: clampScore(parsed.fit_calibration),
      evidence_citation: clampScore(parsed.evidence_citation),
      anti_hallucination: clampScore(parsed.anti_hallucination),
      reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "No reasoning returned.",
    } satisfies SkepticScore;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return placeholderScore(testSet, testCase, `judge parse/request error: ${message}`);
  }
}

function summarize(testSet: TestSet, scores: ScoreFile["cases"]): Record<string, number> {
  if (testSet === "factual") {
    const factualScores = scores as FactualScore[];
    return {
      n: factualScores.length,
      pass_rate: factualScores.length ? factualScores.filter((score) => score.pass).length / factualScores.length : 0,
    };
  }

  if (testSet === "quality") {
    const qualityScores = scores as QualityScore[];
    const specificityAvg = mean(qualityScores.map((score) => score.specificity));
    const evidenceAvg = mean(qualityScores.map((score) => score.evidence_citation));
    const antiHallucinationAvg = mean(qualityScores.map((score) => score.anti_hallucination));
    return {
      n: qualityScores.length,
      specificity_avg: round1(specificityAvg),
      evidence_citation_avg: round1(evidenceAvg),
      anti_hallucination_avg: round1(antiHallucinationAvg),
      overall_avg: round1(mean([specificityAvg, evidenceAvg, antiHallucinationAvg])),
    };
  }

  const skepticScores = scores as SkepticScore[];
  const targetAlignmentAvg = mean(skepticScores.map((score) => score.target_alignment));
  const fitCalibrationAvg = mean(skepticScores.map((score) => score.fit_calibration));
  const evidenceAvg = mean(skepticScores.map((score) => score.evidence_citation));
  const antiHallucinationAvg = mean(skepticScores.map((score) => score.anti_hallucination));
  return {
    n: skepticScores.length,
    fit_level_accuracy: skepticScores.length
      ? skepticScores.filter((score) => score.fit_level_correct).length / skepticScores.length
      : 0,
    target_alignment_avg: round1(targetAlignmentAvg),
    fit_calibration_avg: round1(fitCalibrationAvg),
    evidence_citation_avg: round1(evidenceAvg),
    anti_hallucination_avg: round1(antiHallucinationAvg),
    overall_avg: round1(mean([targetAlignmentAvg, fitCalibrationAvg, evidenceAvg, antiHallucinationAvg])),
  };
}

async function main() {
  const { version, testSet } = parseArgs();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is required.");
    process.exit(1);
  }

  const runPath = repoPath("src", "lib", "eval", "runs", `${version}_${testSet}.json`);
  if (!existsSync(runPath)) {
    console.error(`Run file not found: ${path.relative(process.cwd(), runPath)}`);
    process.exit(1);
  }

  const runFile = await readJsonFile<RunFile>(runPath);
  const scores: ScoreFile["cases"] = [];

  for (let index = 0; index < runFile.cases.length; index += 1) {
    const testCase = runFile.cases[index];
    process.stdout.write(`Judging ${testCase.id} (${index + 1}/${runFile.cases.length})... `);
    const score = await judgeCase(testSet, testCase, apiKey);
    scores.push(score);
    process.stdout.write("done\n");

    if (index < runFile.cases.length - 1) {
      await sleep(JUDGE_DELAY_MS);
    }
  }

  const scoreFile: ScoreFile = {
    version,
    test_set: testSet,
    judge_model: JUDGE_MODEL,
    date: new Date().toISOString(),
    cases: scores,
    summary: summarize(testSet, scores),
  };

  const outputPath = repoPath("src", "lib", "eval", "scores", `${version}_${testSet}.json`);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(scoreFile, null, 2)}\n`);

  console.log(`✓ Wrote scores to ${path.relative(repoPath("src", "lib", "eval"), outputPath)}`);
  console.log(JSON.stringify(scoreFile.summary, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
