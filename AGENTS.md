# AGENTS.md

Engineering constraints and definition of done for the chat feature and agent pipeline.

## Engineering Constraints

### PDF Parsing

- `pdf-parse` v2.4.5 depends on `pdfjs-dist`, which uses a web worker (`pdf.worker.mjs`).
- Turbopack cannot resolve the worker file at bundle time, causing a runtime crash.
- Fix: `serverExternalPackages: ["pdf-parse", "pdfjs-dist"]` in `next.config.ts` — this loads both packages natively via Node.js require, bypassing Turbopack bundling.
- Do not remove this config. Removing it will silently break PDF uploads.

### Agent Models

- Main answer model: `OPENAI_AGENT_MODEL` env var, defaults to `"gpt-5.5"`.
- Context selector: `OPENAI_CONTEXT_MODEL` env var, defaults to `"gpt-4o"`.
- Company websearch: `OPENAI_WEBSEARCH_MODEL` env var, defaults to `"gpt-4o"`.
- `OPENAI_API_KEY` must be set in the runtime environment. The agent route returns a 500 error without it.

### SSE Streaming

- The `/api/agent` route streams `AgentStreamEvent` objects as newline-delimited SSE.
- Event types: `status`, `delta`, `final`, `error`.
- The `final` event carries the full `AgentResponse` struct including `fitLevel`, `headline`, `proofPoints`, etc.
- The client stores `event.response` on the assistant `ChatMessage`. Only `text` (answerText) and `response` fields are persisted client-side. There is no server-side conversation storage.

### Fit Card

- `FitCard` renders only when `response.mode === "fit"`.
- It shows a single pill badge: fit level label + colored dot.
- Fit level values and their badge colors:
  - `"Strong fit"` → green (`#f0fdf4` bg, `#15803d` text)
  - `"Relevant fit"` → blue (`#eff6ff` bg, `#1d4ed8` text)
  - `"Partial fit"` → amber (`#fffbeb` bg, `#b45309` text)
  - `"Not enough evidence"` → gray (`#f5f3ef` bg, `#6b6860` text)
- Do not add proof points, gaps, or follow-up chips to the FitCard. The badge is the entire UI.
- For `responseType "qa"`, the agent sets `mode: "ask"` and FitCard is not shown.

### No Scores or Ratings

- The agent must never produce a match score, rating, percentage, or 0–10 fit number.
- `fitLevel` is an enum with four values — not a numeric scale.

## Definition of Done

A chat feature change is complete when all of the following pass:

1. `node node_modules/typescript/lib/tsc.js --noEmit` — no type errors.
2. `npm run lint` — no lint errors.
3. PDF upload at `/chat` parses successfully and the file chip shows "Ready".
4. Sending a JD (file or pasted text) produces a response with a fit level badge.
5. Sending a general question produces a response with no fit badge.
6. The `/api/agent` route returns a valid SSE stream when `OPENAI_API_KEY` is set.
