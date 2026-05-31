# Agent Evaluation Suite

This folder contains the offline evaluation harness for the `/api/agent` hiring assistant.

## Directory Structure

- `cases/` contains authored eval cases.
- `runs/` contains raw agent responses and SSE telemetry captured by `run-eval.ts`.
- `scores/` contains LLM judge outputs from `judge.ts`.
- `summaries/` contains JSON and Markdown rollups from `compare.ts`.
- `scripts/` contains the runner, judge, and comparison scripts.
- `types.ts` contains the shared TypeScript types used by all scripts.

The scripts prefer `src/lib/eval/cases/{factual,quality,skeptic}.json`. For local compatibility, `run-eval.ts` can also read the current flat `src/lib/eval/*.json` files.

## Running

Capture raw responses and latency:

```bash
npx tsx src/lib/eval/scripts/run-eval.ts v1 factual
npx tsx src/lib/eval/scripts/run-eval.ts v1 quality
npx tsx src/lib/eval/scripts/run-eval.ts v1 skeptic
```

For a quick smoke run, set `EVAL_CASE_LIMIT=3`.

Judge a completed run:

```bash
npx tsx src/lib/eval/scripts/judge.ts v1 factual
```

Summarize one version or compare two:

```bash
npx tsx src/lib/eval/scripts/compare.ts v1
npx tsx src/lib/eval/scripts/compare.ts v1 v2
```

Fetch historical OpenAI usage and estimated cost for saved V1/V2/V3 eval windows:

```bash
OPENAI_ADMIN_KEY=sk-admin-... npx tsx src/lib/Eval/scripts/fetch-openai-usage.ts
```

The usage script writes `summaries/openai_usage_costs.json`. It uses the saved run timestamps and requires an OpenAI key with `api.usage.read` scope. The saved eval files did not capture per-request token usage, so this is the cleanest no-rerun path.

## Environment

- `ANTHROPIC_API_KEY` is required for `judge.ts`.
- `EVAL_API_URL` is optional for `run-eval.ts`; it defaults to `https://rakshitlodha.com/api/agent`.
- `OPENAI_ADMIN_KEY` or an `OPENAI_API_KEY` with `api.usage.read` scope is required for `fetch-openai-usage.ts`.

## Latency Caveat

Latency metrics come from single sequential runs. Upstream LLM and web-search variance can easily move timings by 20-50%, so compare trends across full test sets rather than over-reading a single case.
