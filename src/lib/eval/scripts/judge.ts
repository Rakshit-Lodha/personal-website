import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CaseResult, FactualScore, QualityScore, RunFile, ScoreFile, SkepticScore, TestSet } from "../types";

const TEST_SETS: TestSet[] = ["factual", "quality", "skeptic"];
const JUDGE_MODEL = "claude-opus-4-7";
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

function qualityPrompt(testCase: CaseResult) {
  return `You are scoring an AI agent's response to an open-ended question about a person named Rakshit Lodha (an AI Product Manager). Score on three dimensions, each 1-4.

QUESTION: ${testCase.question}

AGENT'S RESPONSE: ${testCase.answer_text}

DIMENSIONS:
1. Specificity (1-4): Does the answer reference specific projects, roles, metrics, or shipped outcomes? 4 = consistently specific with named projects and concrete numbers. 1 = entirely generic capability-soup with no specifics.
2. Evidence-citation (1-4): Is each capability claim immediately tied to where it was demonstrated? 4 = every claim has an accompanying evidence pointer (project, role, outcome). 1 = capabilities listed without evidence.
3. Anti-hallucination (1-4): Does the answer avoid inventing claims, combining unrelated facts, or stretching evidence to fit the question? 4 = strictly grounded, admits limits where evidence is thin. 1 = clear fabrication or unsupported leaps.

Respond with ONLY a JSON object, no other text:
{"specificity": <1-4>, "evidence_citation": <1-4>, "anti_hallucination": <1-4>, "reasoning": "2-3 sentences explaining the scores"}`;
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
  return `You are scoring an AI agent's fit assessment of a person (Rakshit Lodha) against a job description or scenario. The agent must classify fit as one of: "Strong fit", "Relevant fit", "Partial fit", or "Not enough evidence".

SCENARIO: ${testCase.question}

EXPECTED FIT: ${testCase.expected ?? ""}
EXPECTED FIT LEVEL (parsed): ${expectedFitLevel}
AGENT'S FIT LEVEL: ${actualFitLevel}
AGENT'S FULL EXPLANATION: ${testCase.answer_text}

Score:
1. fit_level_correct: did the agent's fit level match the expected? (true|false)
2. Specificity (1-4): same definition as the quality rubric — does the explanation name specific projects/roles/outcomes?
3. Evidence-citation (1-4): does the explanation tie each strength/gap claim to specific evidence?
4. Anti-hallucination (1-4): does the explanation avoid inventing experience the candidate doesn't have?

Respond with ONLY a JSON object, no other text:
{"fit_level_correct": true|false, "expected_fit_level": "...", "actual_fit_level": "...", "specificity": <1-4>, "evidence_citation": <1-4>, "anti_hallucination": <1-4>, "reasoning": "2-4 sentences"}`;
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
    specificity: 1,
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
      const parsed = await callJudge(qualityPrompt(testCase), apiKey);
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
      specificity: clampScore(parsed.specificity),
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
  const specificityAvg = mean(skepticScores.map((score) => score.specificity));
  const evidenceAvg = mean(skepticScores.map((score) => score.evidence_citation));
  const antiHallucinationAvg = mean(skepticScores.map((score) => score.anti_hallucination));
  return {
    n: skepticScores.length,
    fit_level_accuracy: skepticScores.length
      ? skepticScores.filter((score) => score.fit_level_correct).length / skepticScores.length
      : 0,
    specificity_avg: round1(specificityAvg),
    evidence_citation_avg: round1(evidenceAvg),
    anti_hallucination_avg: round1(antiHallucinationAvg),
    overall_avg: round1(mean([specificityAvg, evidenceAvg, antiHallucinationAvg])),
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
