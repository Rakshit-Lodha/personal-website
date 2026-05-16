# Task: Build the eval runner, LLM judge, and comparison scripts

## Context

This repo hosts an AI hiring assistant at `/api/agent` that streams responses via Server-Sent Events. The pipeline has 3 stages (optional websearch → context selector → answer agent). Every `status` event in the stream includes `stage` (machine-readable identifier), `elapsed_ms` (milliseconds since request start), and `message` (human-readable label).

I'm building an evaluation suite to measure agent quality and latency across versions. The test cases are already authored and live at:

- `src/lib/eval/cases/factual.json` (20 cases — binary pass/fail on factual recall)
- `src/lib/eval/cases/quality.json` (20 cases — rubric-scored open-ended answers)
- `src/lib/eval/cases/skeptic.json` (10 cases — fit assessments against JDs)

For skeptic cases, the JD content is either inline (`scenario` field, string) or referenced via a file path (`scenario_file` field, string — a relative path from `src/lib/eval/cases/`, e.g., `"jds/S05_enterprise_logistics.txt"`).

Each case has an `id` (string), a question (`q` or `scenario`), and ground truth (`ground_truth` for factual, `expected_fit` for skeptic, none for quality). All cases share that base shape.

I need three scripts under `src/lib/eval/scripts/`:

1. `run-eval.ts` — hits the agent API and captures responses + telemetry
2. `judge.ts` — uses Claude Opus 4.7 to score responses
3. `compare.ts` — generates per-version summaries (latency + scores) and diff reports

All output is JSON; `compare.ts` additionally produces markdown summary tables.

## Shared TypeScript types

Create `src/lib/eval/types.ts` with these types, used by all three scripts:

````typescript
export type StageTiming = {
  stage: string;
  elapsed_ms: number;
  message: string;
};

export type CaseResult = {
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

export type RunFile = {
  version: string;
  test_set: "factual" | "quality" | "skeptic";
  date: string;
  system_prompt_sha: string;
  api_url: string;
  cases: CaseResult[];
};

export type FactualScore = {
  id: string;
  pass: boolean;
  reasoning: string;
};

export type QualityScore = {
  id: string;
  specificity: number;
  evidence_citation: number;
  anti_hallucination: number;
  reasoning: string;
};

export type SkepticScore = {
  id: string;
  fit_level_correct: boolean;
  expected_fit_level: string;
  actual_fit_level: string;
  specificity: number;
  evidence_citation: number;
  anti_hallucination: number;
  reasoning: string;
};

export type ScoreFile = {
  version: string;
  test_set: "factual" | "quality" | "skeptic";
  judge_model: string;
  date: string;
  cases: Array<FactualScore | QualityScore | SkepticScore>;
  summary: Record<string, number>;
};
````

## File 1: `src/lib/eval/scripts/run-eval.ts`

### Purpose

Hit the deployed agent API for each test case in a given test set, capture the full response and timing data, write results to `src/lib/eval/runs/{version}_{testset}.json`.

### Invocation

````bash
npx tsx src/lib/eval/scripts/run-eval.ts <version> <testset>
# e.g. npx tsx src/lib/eval/scripts/run-eval.ts v1 factual
````

### Behavior

1. Read CLI args: `version` (any string, e.g., "v1"), `testset` (one of `factual`, `quality`, `skeptic`). Exit with an error message if either is missing or invalid.
2. Load test cases from `src/lib/eval/cases/{testset}.json` (an array of cases).
3. Capture the current git commit SHA via `execSync("git rev-parse HEAD")` for the `system_prompt_sha` field.
4. Determine the API URL from `process.env.EVAL_API_URL`, defaulting to `"https://rakshitlodha.com/api/agent"`.
5. Determine the mode: `"fit"` for the skeptic set, `"auto"` for factual and quality.
6. For each test case, **sequentially**:
   a. Determine the question text. Priority: `case.q` → `case.scenario` (if string) → load file at `src/lib/eval/cases/{case.scenario_file}` if `scenario_file` is set.
   b. POST to the API:
````ts
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          messages: [{ role: "user", content: questionText }]
        })
      })
````
   c. Parse the SSE stream. Each event is `data: {...json...}\n\n`.
   d. Capture:
      * Every `status` event into a `stages` array
      * `first_delta_ms`: time from POST start to the first `delta` event (or `null` if no delta event ever fires)
      * Accumulate `delta.text` chunks into `answer_text`
      * Capture the `final` event's `response` payload as `response`
   e. Record `total_ms` (time from POST start to stream close).
   f. Build the `CaseResult`. Use `case.ground_truth || case.expected_fit || null` for `expected`.
   g. Push the result.
   h. Wait 1500ms before the next case.
7. If any single case fails (network error, non-200 response, malformed SSE that can't be parsed), log the error to stderr, save a `CaseResult` with `error: <message>` for that case (other fields null/empty), and continue.
8. Write the aggregate `RunFile` to `src/lib/eval/runs/{version}_{testset}.json` with `JSON.stringify(data, null, 2)`. Create the `runs/` directory if it doesn't exist.
9. Print a summary:
````
   ✓ Wrote N results to runs/v1_factual.json
   Mean total_ms: 8420
   Mean first_delta_ms: 4180
   Errors: 0
````

### Constraints

* Sequential only — never parallelize requests. The pipeline does multiple LLM calls per request and parallel hits will rate-limit.
* Don't retry failed cases automatically — failures must be visible in the output for manual review.
* Use Node's built-in `fetch` and `ReadableStream` (`response.body.getReader()`). No new dependencies.
* Use the shared types from `src/lib/eval/types.ts`.
* If `scenario_file` references a path that doesn't exist, that's an error condition — log it and save `error: "scenario_file not found: <path>"` for that case.

## File 2: `src/lib/eval/scripts/judge.ts`

### Purpose

Score the responses in a run file using Claude Opus 4.7 as the judge. Different scoring logic per test set.

### Invocation

````bash
npx tsx src/lib/eval/scripts/judge.ts <version> <testset>
# Reads src/lib/eval/runs/{version}_{testset}.json
# Writes src/lib/eval/scores/{version}_{testset}.json
````

### Behavior

1. Read CLI args: `version`, `testset`. Validate as in run-eval.
2. Load the run file from `src/lib/eval/runs/{version}_{testset}.json`.
3. Read `ANTHROPIC_API_KEY` from environment. Exit with error if missing.
4. For each case in the run file:
   a. If the case has an `error` field, skip judging — save a placeholder score (`pass: false` for factual, all dimensions = 1 for quality/skeptic, with `reasoning: "skipped due to run error: <error>"`).
   b. Otherwise, build a judge prompt based on test set (templates below).
   c. POST to Anthropic API:
````ts
      fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-opus-4-7",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }]
        })
      })
````
   d. Parse the response. The judge returns JSON in a code block. Strip ` ```json` / ` ``` ` fences before `JSON.parse`. Handle parse failures by saving the case with all-1 scores and a note in `reasoning`.
   e. Wait 1000ms before the next case.
5. Compute the summary:
   * **factual**: `summary = { n, pass_rate }`
   * **quality**: `summary = { n, specificity_avg, evidence_citation_avg, anti_hallucination_avg, overall_avg }`
   * **skeptic**: `summary = { n, fit_level_accuracy, specificity_avg, evidence_citation_avg, anti_hallucination_avg, overall_avg }`
6. Write the `ScoreFile` to `src/lib/eval/scores/{version}_{testset}.json`. Create the `scores/` directory if it doesn't exist.
7. Print summary to stdout.

### Judge prompt templates

**Factual** (use `case.expected` as ground truth):

````
You are scoring an AI agent's response to a factual question.

QUESTION: {question}

GROUND TRUTH: {ground_truth}

AGENT'S RESPONSE: {answer_text}

Determine whether the agent's response correctly conveys the ground truth fact. Minor wording differences are fine. Numerical or temporal precision must match — "around ₹80Cr" does NOT pass for "₹100Cr". The agent passes if the ground truth fact is clearly present in the response, even amid additional content.

Respond with ONLY a JSON object, no other text:
{"pass": true|false, "reasoning": "one sentence explanation"}
````

**Quality:**

````
You are scoring an AI agent's response to an open-ended question about a person named Rakshit Lodha (an AI Product Manager). Score on three dimensions, each 1-4.

QUESTION: {question}

AGENT'S RESPONSE: {answer_text}

DIMENSIONS:
1. Specificity (1-4): Does the answer reference specific projects, roles, metrics, or shipped outcomes? 4 = consistently specific with named projects and concrete numbers. 1 = entirely generic capability-soup with no specifics.
2. Evidence-citation (1-4): Is each capability claim immediately tied to where it was demonstrated? 4 = every claim has an accompanying evidence pointer (project, role, outcome). 1 = capabilities listed without evidence.
3. Anti-hallucination (1-4): Does the answer avoid inventing claims, combining unrelated facts, or stretching evidence to fit the question? 4 = strictly grounded, admits limits where evidence is thin. 1 = clear fabrication or unsupported leaps.

Respond with ONLY a JSON object, no other text:
{"specificity": <1-4>, "evidence_citation": <1-4>, "anti_hallucination": <1-4>, "reasoning": "2-3 sentences explaining the scores"}
````

**Skeptic:**

The case has `expected_fit` (e.g., "Partial fit — strong on AI PM, weak on enterprise B2B...") and the agent's `response` contains a `fitLevel` field (one of: "Strong fit", "Relevant fit", "Partial fit", "Not enough evidence").

First, parse the agent's fitLevel from `response.fitLevel`. Then determine the expected fit_level (parse the leading category from `expected_fit` — usually the first 1-3 words before a dash or "—").

````
You are scoring an AI agent's fit assessment of a person (Rakshit Lodha) against a job description or scenario. The agent must classify fit as one of: "Strong fit", "Relevant fit", "Partial fit", or "Not enough evidence".

SCENARIO: {question}

EXPECTED FIT: {expected_fit}
EXPECTED FIT LEVEL (parsed): {expected_fit_level}
AGENT'S FIT LEVEL: {actual_fit_level}
AGENT'S FULL EXPLANATION: {answer_text}

Score:
1. fit_level_correct: did the agent's fit level match the expected? (true|false)
2. Specificity (1-4): same definition as the quality rubric — does the explanation name specific projects/roles/outcomes?
3. Evidence-citation (1-4): does the explanation tie each strength/gap claim to specific evidence?
4. Anti-hallucination (1-4): does the explanation avoid inventing experience the candidate doesn't have?

Respond with ONLY a JSON object, no other text:
{"fit_level_correct": true|false, "expected_fit_level": "...", "actual_fit_level": "...", "specificity": <1-4>, "evidence_citation": <1-4>, "anti_hallucination": <1-4>, "reasoning": "2-4 sentences"}
````

## File 3: `src/lib/eval/scripts/compare.ts`

### Purpose

Two modes:

1. **Single-version summary mode**: `npx tsx compare.ts <version>` — summarizes one version across all three test sets, including latency.
2. **Diff mode**: `npx tsx compare.ts <version_a> <version_b>` — produces a side-by-side comparison.

Outputs both JSON and markdown to `src/lib/eval/summaries/`.

### Invocation

````bash
# Single-version summary
npx tsx src/lib/eval/scripts/compare.ts v1

# Diff between two versions
npx tsx src/lib/eval/scripts/compare.ts v1 v2
````

### Behavior (single-version mode)

1. Load all three score files for the version: `scores/{version}_factual.json`, `scores/{version}_quality.json`, `scores/{version}_skeptic.json`. If any are missing, log and skip that test set.
2. Load all three run files for latency data: `runs/{version}_factual.json`, etc.
3. Compute aggregated metrics:
   * **Scores per test set**: from the summary fields of each score file
   * **Latency per test set**: from the run files, compute mean / median / p95 for `total_ms` and mean for `first_delta_ms`
   * **Stage latency**: compute mean elapsed for `context` (use `context_complete.elapsed_ms` minus `context_start.elapsed_ms`), `answer` (same pattern), and `websearch` (only across cases that ran websearch)
   * **Overall**: rolled-up totals across all 50 cases
4. Write JSON summary to `src/lib/eval/summaries/{version}_summary.json` with this shape:

````json
{
  "version": "v1",
  "date": "...",
  "scores": {
    "factual": {"n": 20, "pass_rate": 0.85},
    "quality": {"n": 20, "specificity_avg": 2.8, "evidence_citation_avg": 2.5, "anti_hallucination_avg": 3.1, "overall_avg": 2.8},
    "skeptic": {"n": 10, "fit_level_accuracy": 0.7, "specificity_avg": 2.9, ...}
  },
  "latency": {
    "factual": {"total_mean_ms": 8420, "total_median_ms": 8100, "total_p95_ms": 12300, "first_delta_mean_ms": 4180, "n_url_path": 0},
    "quality": {...},
    "skeptic": {...},
    "overall": {"total_mean_ms": 13200, "total_median_ms": 10900, "total_p95_ms": 28100, "first_delta_mean_ms": 6200, "n": 50},
    "stages_mean_ms": {"websearch": 6800, "context": 4100, "answer": 8300},
    "by_websearch_path": {
    "had_websearch": {"n": 7, "total_mean_ms": 22100, ...},
    "no_websearch": {"n": 43, "total_mean_ms": 9800, ...}
  }
  }
}
````

5. Write a markdown summary to `src/lib/eval/summaries/{version}_summary.md`:

````markdown
# V1 Evaluation Summary

Date: 2026-05-12
System prompt SHA: abc1234

## Scores

| Test Set | N  | Metric                   | Score |
|----------|----|--------------------------|-------|
| Factual  | 20 | Pass rate                | 85%   |
| Quality  | 20 | Specificity (avg)        | 2.8/4 |
| Quality  | 20 | Evidence-citation (avg)  | 2.5/4 |
| Quality  | 20 | Anti-hallucination (avg) | 3.1/4 |
| Skeptic  | 10 | Fit-level accuracy       | 70%   |
| Skeptic  | 10 | Explanation overall avg  | 2.9/4 |

## Latency

| Test Set | N  | Mean Total | Median Total | p95 Total | Mean First Delta |
|----------|----|-----------|--------------|-----------|------------------|
| Factual  | 20 | 8.4s      | 8.1s         | 12.3s     | 4.2s             |
| Quality  | 20 | 11.2s     | 10.8s        | 18.4s     | 5.1s             |
| Skeptic  | 10 | 22.1s     | 21.5s        | 31.2s     | 11.8s            |
| **All**  | 50 | 13.2s     | 10.9s        | 28.1s     | 6.2s             |

## Stage Latency (mean)

| Stage     | Mean   |
|-----------|--------|
| Websearch | 6.8s   |
| Context   | 4.1s   |
| Answer    | 8.3s   |

Notes:
- Single-run timings. Run-to-run variance from upstream APIs is typically 20-50%.
- Stage means computed only across cases where the stage ran.
````

### Behavior (diff mode)

When both `version_a` and `version_b` are passed:

1. Run the single-version summary computation for both.
2. Write `src/lib/eval/summaries/{a}_vs_{b}.json` with both summaries plus delta fields:
````json
   {
     "version_a": "v1",
     "version_b": "v2",
     "scores_delta": {
       "factual_pass_rate": "+0.10",
       "quality_overall_avg": "+0.4",
       "skeptic_fit_level_accuracy": "+0.10"
     },
     "latency_delta": {
       "overall_mean_ms": "-1200",
       "overall_first_delta_mean_ms": "-800"
     }
   }
````
3. Write a markdown diff at `src/lib/eval/summaries/{a}_vs_{b}.md` that shows both versions side-by-side in each table, with deltas in a "Δ" column. Regressions (worse scores, higher latency) should be marked clearly — e.g., prefix with "⚠" or use plain text annotations like "(regression)". Don't use emoji for status — keep markdown plain.

### Constraints

* Use the shared types from `src/lib/eval/types.ts`.
* Median and p95 should be computed using a simple sort-and-index approach (don't introduce a stats library).
* Round latency values to the nearest 100ms when rendering markdown (`8.4s` not `8420ms`). Keep raw `_ms` values in JSON.
* Round score averages to 1 decimal place.
* Round percentages to whole numbers in markdown, but keep precise floats in JSON.

## Out of scope

* Do not modify `src/app/api/agent/route.ts` or any production agent code.
* Do not modify the test case JSON files at `src/lib/eval/cases/`.
* Do not write the `/evals` page UI — that's a separate task.
* Do not add tests for the eval scripts themselves (will be added later if needed).
* Do not add a database, cache, or any persistent storage beyond the JSON files described.

## Deliverable

A single PR / commit that adds:
- `src/lib/eval/types.ts`
- `src/lib/eval/scripts/run-eval.ts`
- `src/lib/eval/scripts/judge.ts`
- `src/lib/eval/scripts/compare.ts`

Plus a brief README at `src/lib/eval/README.md` (~30 lines) documenting:
- The directory structure (cases / runs / scores / summaries)
- How to run each script
- The environment variables required (`ANTHROPIC_API_KEY`, optional `EVAL_API_URL`)
- The single-run-variance caveat for latency interpretation

## Verification

After implementation, run:
````bash
node node_modules/typescript/lib/tsc.js --noEmit  # type check passes
npm run lint                                       # lint passes
````

Then a smoke test (do not commit results):
````bash
ANTHROPIC_API_KEY=... npx tsx src/lib/eval/scripts/run-eval.ts v0-smoke factual
# Verify it produces src/lib/eval/runs/v0-smoke_factual.json with at least the first 2-3 cases
# (you can Ctrl+C after a few cases — full run not needed for smoke test)
````

Then `git checkout src/lib/eval/runs/v0-smoke_factual.json` to clean up.

````

