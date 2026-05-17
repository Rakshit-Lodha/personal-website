import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { CaseResult, RunFile, StageTiming, TestSet } from "../types";

loadEnvConfig(process.cwd());

const TEST_SETS: TestSet[] = ["factual", "quality", "skeptic"];
const DEFAULT_API_URL = "https://rakshitlodha.com/api/agent";
const CASE_DELAY_MS = 1500;

type EvalCase = {
  id?: unknown;
  q?: unknown;
  scenario?: unknown;
  scenario_file?: unknown;
  ground_truth?: unknown;
  expected_fit?: unknown;
};

type StreamEvent =
  | { type: "status"; stage?: unknown; elapsed_ms?: unknown; message?: unknown }
  | { type: "delta"; text?: unknown }
  | { type: "final"; response?: unknown }
  | { type: "error"; message?: unknown };

function usage(): never {
  console.error("Usage: npx tsx src/lib/eval/scripts/run-eval.ts <version> <factual|quality|skeptic>");
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

function getCasesPath(testSet: TestSet) {
  const expectedPath = repoPath("src", "lib", "eval", "cases", `${testSet}.json`);
  if (existsSync(expectedPath)) return { casesPath: expectedPath, casesDir: path.dirname(expectedPath) };

  const legacyPath = repoPath("src", "lib", "eval", `${testSet}.json`);
  if (existsSync(legacyPath)) {
    console.warn(`Warning: using legacy case file path ${path.relative(process.cwd(), legacyPath)}`);
    return { casesPath: legacyPath, casesDir: path.dirname(legacyPath) };
  }

  return { casesPath: expectedPath, casesDir: path.dirname(expectedPath) };
}

async function loadCases(testSet: TestSet) {
  const { casesPath, casesDir } = getCasesPath(testSet);
  const raw = await readFile(casesPath, "utf8");
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`Case file must contain an array: ${path.relative(process.cwd(), casesPath)}`);
  }

  return { cases: parsed as EvalCase[], casesDir };
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function resolveLegacyScenarioPath(scenario: string, casesDir: string) {
  if (!/\.(txt|md)$/i.test(scenario)) return null;

  const candidates = [
    path.resolve(casesDir, scenario),
    repoPath("src", "lib", scenario),
    repoPath("src", "lib", scenario.replace(/^JDS\//i, "JDs/")),
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

async function getQuestionText(testCase: EvalCase, casesDir: string) {
  const q = stringValue(testCase.q);
  if (q) return q;

  const scenario = stringValue(testCase.scenario);
  if (scenario) {
    const legacyPath = resolveLegacyScenarioPath(scenario, casesDir);
    return legacyPath ? readFile(legacyPath, "utf8") : scenario;
  }

  const scenarioFile = stringValue(testCase.scenario_file);
  if (scenarioFile) {
    const fullPath = path.resolve(casesDir, scenarioFile);
    if (!existsSync(fullPath)) {
      throw new Error(`scenario_file not found: ${scenarioFile}`);
    }
    return readFile(fullPath, "utf8");
  }

  throw new Error("case has no q, scenario, or scenario_file");
}

function getExpected(testCase: EvalCase) {
  return stringValue(testCase.ground_truth) || stringValue(testCase.expected_fit);
}

function getCaseId(testCase: EvalCase, index: number) {
  return stringValue(testCase.id) || `case_${index + 1}`;
}

function emptyResult(testCase: EvalCase, index: number, error: string): CaseResult {
  return {
    id: getCaseId(testCase, index),
    question: "",
    expected: getExpected(testCase),
    response: null,
    answer_text: "",
    stages: [],
    first_delta_ms: null,
    total_ms: 0,
    error,
  };
}

function asStageTiming(event: Extract<StreamEvent, { type: "status" }>): StageTiming {
  return {
    stage: typeof event.stage === "string" ? event.stage : "",
    elapsed_ms: typeof event.elapsed_ms === "number" ? event.elapsed_ms : 0,
    message: typeof event.message === "string" ? event.message : "",
  };
}

function parseSseChunk(buffer: string) {
  const events = buffer.split("\n\n");
  return { completeEvents: events.slice(0, -1), remainder: events.at(-1) ?? "" };
}

function parseDataEvent(rawEvent: string): StreamEvent | null {
  const dataLines = rawEvent
    .split("\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.slice(6));

  if (dataLines.length === 0) return null;
  return JSON.parse(dataLines.join("\n")) as StreamEvent;
}

async function runCase(testCase: EvalCase, index: number, casesDir: string, apiUrl: string, mode: "auto" | "fit") {
  const question = await getQuestionText(testCase, casesDir);
  const startedAt = Date.now();
  const stages: StageTiming[] = [];
  let answerText = "";
  let firstDeltaMs: number | null = null;
  let finalResponse: Record<string, unknown> | null = null;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode,
      messages: [{ role: "user", content: question }],
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`agent request failed: HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const { completeEvents, remainder } = parseSseChunk(buffer);
    buffer = remainder;

    for (const rawEvent of completeEvents) {
      const event = parseDataEvent(rawEvent);
      if (!event) continue;

      if (event.type === "status") {
        stages.push(asStageTiming(event));
      } else if (event.type === "delta") {
        if (firstDeltaMs === null) firstDeltaMs = Date.now() - startedAt;
        if (typeof event.text === "string") answerText += event.text;
      } else if (event.type === "final") {
        finalResponse =
          event.response && typeof event.response === "object" && !Array.isArray(event.response)
            ? (event.response as Record<string, unknown>)
            : null;
      } else if (event.type === "error") {
        throw new Error(typeof event.message === "string" ? event.message : "agent returned error event");
      }
    }
  }

  if (buffer.trim()) {
    const event = parseDataEvent(buffer);
    if (event?.type === "final" && event.response && typeof event.response === "object" && !Array.isArray(event.response)) {
      finalResponse = event.response as Record<string, unknown>;
    }
  }

  return {
    id: getCaseId(testCase, index),
    question,
    expected: getExpected(testCase),
    response: finalResponse,
    answer_text: answerText || (typeof finalResponse?.answerText === "string" ? finalResponse.answerText : ""),
    stages,
    first_delta_ms: firstDeltaMs,
    total_ms: Date.now() - startedAt,
  } satisfies CaseResult;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getCaseLimit() {
  const raw = process.env.EVAL_CASE_LIMIT;
  if (!raw) return null;

  const limit = Number(raw);
  return Number.isInteger(limit) && limit > 0 ? limit : null;
}

async function writeRunFile(runFile: RunFile, outputPath: string) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(runFile, null, 2)}\n`);
}

async function main() {
  const { version, testSet } = parseArgs();
  const apiUrl = process.env.EVAL_API_URL || DEFAULT_API_URL;
  const mode = testSet === "skeptic" ? "fit" : "auto";
  const { cases, casesDir } = await loadCases(testSet);
  const caseLimit = getCaseLimit();
  const selectedCases = caseLimit ? cases.slice(0, caseLimit) : cases;
  const outputPath = repoPath("src", "lib", "eval", "runs", `${version}_${testSet}.json`);
  const runFile: RunFile = {
    version,
    test_set: testSet,
    date: new Date().toISOString(),
    prompt_version: process.env.OPENAI_AGENT_PROMPT_VERSION || "v1",
    profile_version: process.env.OPENAI_PROFILE_VERSION || "v1",
    system_prompt_sha: execSync("git rev-parse HEAD", { encoding: "utf8" }).trim(),
    api_url: apiUrl,
    cases: [],
  };

  let interrupted = false;
  process.once("SIGINT", () => {
    interrupted = true;
  });

  for (let index = 0; index < selectedCases.length; index += 1) {
    if (interrupted) break;

    const testCase = selectedCases[index];
    const id = getCaseId(testCase, index);
    process.stdout.write(`Running ${id} (${index + 1}/${selectedCases.length})... `);

    try {
      const result = await runCase(testCase, index, casesDir, apiUrl, mode);
      runFile.cases.push(result);
      process.stdout.write(`done in ${result.total_ms}ms\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`\n${id} failed: ${message}`);
      runFile.cases.push(emptyResult(testCase, index, message));
    }

    if (index < selectedCases.length - 1 && !interrupted) {
      await sleep(CASE_DELAY_MS);
    }
  }

  await writeRunFile(runFile, outputPath);

  const totals = runFile.cases.filter((result) => !result.error).map((result) => result.total_ms);
  const firstDeltas = runFile.cases
    .filter((result) => !result.error && result.first_delta_ms !== null)
    .map((result) => result.first_delta_ms as number);
  const errors = runFile.cases.filter((result) => result.error).length;
  const relativeOutputPath = path.relative(repoPath("src", "lib", "eval"), outputPath);

  console.log(`✓ Wrote ${runFile.cases.length} results to ${relativeOutputPath}`);
  console.log(`Mean total_ms: ${mean(totals)}`);
  console.log(`Mean first_delta_ms: ${mean(firstDeltas)}`);
  console.log(`Errors: ${errors}`);

  if (interrupted) {
    console.log("Interrupted after current case; partial run file saved.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
