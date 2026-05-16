# Evals Feature Summary

## What We Built

We added an evaluation workflow for the `/api/agent` hiring assistant so Rakshit can measure answer quality, fit calibration, and latency across versions.

The feature has four parts:

1. Stage-level SSE telemetry in the agent API.
2. Local eval scripts for running, judging, and comparing versions.
3. A visual `/evals` dashboard.
4. A chat zero-state link: `Want to check if it's biased? View evals →`.

## Agent Telemetry

`src/app/api/agent/route.ts` now emits richer `status` events:

```json
{
  "type": "status",
  "stage": "context_complete",
  "elapsed_ms": 4823,
  "message": "Summarizing relevant context"
}
```

The supported stage names are:

- `websearch_start`
- `websearch_complete`
- `context_start`
- `context_complete`
- `answer_start`
- `answer_complete`

The chat UI still reads only `message`, so this is additive and does not change user-facing streaming behavior.

## Eval Scripts

The eval tooling lives under `src/lib/eval/`.

Directory roles:

- `cases/` or flat legacy JSON files: authored eval cases.
- `runs/`: raw agent responses and SSE timing output.
- `scores/`: LLM judge scores.
- `summaries/`: generated JSON and Markdown summaries.
- `scripts/`: executable eval tools.

Scripts:

```bash
npx tsx src/lib/eval/scripts/run-eval.ts v1 factual
npx tsx src/lib/eval/scripts/run-eval.ts v1 quality
npx tsx src/lib/eval/scripts/run-eval.ts v1 skeptic
```

Then:

```bash
npx tsx src/lib/eval/scripts/judge.ts v1 factual
npx tsx src/lib/eval/scripts/judge.ts v1 quality
npx tsx src/lib/eval/scripts/judge.ts v1 skeptic
```

Then:

```bash
npx tsx src/lib/eval/scripts/compare.ts v1
```

`run-eval.ts` uses `EVAL_API_URL`, defaulting to production:

```bash
EVAL_API_URL=http://localhost:3000/api/agent npx tsx src/lib/eval/scripts/run-eval.ts v1 factual
```

For smoke tests:

```bash
EVAL_CASE_LIMIT=3 npx tsx src/lib/eval/scripts/run-eval.ts v0-smoke factual
```

`judge.ts` loads `.env.local` via Next's env loader and requires `ANTHROPIC_API_KEY`.

## Skeptic Judge Update

The skeptic judge was rewritten because the original rubric overvalued generic specificity.

Old skeptic rubric:

- specificity
- evidence citation
- anti-hallucination

Problem: a response could cite real evidence and still be a bad fit assessment if it overweighted adjacent evidence and underweighted hard gaps.

New skeptic rubric:

- `fit_level_correct`
- `target_alignment`
- `fit_calibration`
- `evidence_citation`
- `anti_hallucination`

The judge is now target-aware. It handles:

- full JDs,
- short role scenarios,
- company websites or names,
- vague fit questions.

For JDs, it identifies core must-have requirements. For company websites, it looks for public product/domain/business signals. For vague prompts, it rewards caution and penalizes unsupported inference.

Example outcome for S01 Optum ML Engineer:

- Expected: `Not enough evidence`
- Agent returned: `Relevant fit`
- Target alignment: `2/4`
- Fit calibration: `2/4`

This correctly flags that the agent overweighted adjacent GenAI/product experience while underweighting hard ML-engineering gaps such as advanced ML degree, Spark/PySpark, ML frameworks, model optimization, MLOps, and deep ML foundation.

## Visual Dashboard

`/evals` shows:

- versions discovered automatically from eval JSON files,
- factual pass rate,
- quality score,
- skeptic fit accuracy,
- mean latency,
- score bars by test set,
- latency table,
- failed or mismatched cases with judge reasoning.

Future versions such as `v2` appear automatically after generating:

- `runs/v2_*.json`
- `scores/v2_*.json`
- optionally `summaries/v2_summary.json`

## Current V1 Snapshot

Current V1 summary after rejudging skeptic:

```json
{
  "factual_pass_rate": 1,
  "quality_overall_avg": 3.2,
  "skeptic_fit_level_accuracy": 0.25,
  "skeptic_target_alignment_avg": 3,
  "skeptic_fit_calibration_avg": 2.4,
  "skeptic_overall_avg": 2.8
}
```

Latency from the captured V1 run:

- factual mean: `5.8s`
- quality mean: `8.1s`
- skeptic mean: `21.9s`
- overall mean: `10.4s`

Stage-level latency is not shown in the dashboard right now because the captured V1 run had zero/missing stage timings from the deployed API. Future runs captured against a deployed telemetry build will still store stage data in the raw JSON and summaries.

## Important Caveats

- Eval runs are sequential by design to avoid rate-limit pressure.
- Judge results are useful diagnostics, not absolute truth.
- Latency has high run-to-run variance because upstream model and web-search calls vary.
- Re-run `run-eval` before judging if case files change. The judge reads saved run files; it does not reread cases directly.
- The current skeptic case file has 12 cases, including duplicate `S10_positive_control` IDs. This works, but unique IDs would make summaries and debugging cleaner.
