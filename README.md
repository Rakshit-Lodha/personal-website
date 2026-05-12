# Agent Layer

This folder supports the `/chat` hiring assistant described in the root
`README.md`, `chatfeature.md`, and `AGENTS.md`.

The chat product is a single interface for three recruiter workflows:

- company URL fit checks with public company research
- JD / role-fit evaluation from pasted text or uploaded PDF, DOCX, or TXT files
- general Q&A about Rakshit's background, projects, outcomes, skills, and work style

The API route lives at `src/app/api/agent/route.ts`. It streams newline-delimited
SSE events to the browser:

- `status` events for progress messages
- `delta` events for answer text chunks
- `final` with the full structured `AgentResponse`
- `error` when the live agent cannot complete

The final response includes structured fit fields such as `fitLevel`, `headline`,
`proofPoints`, `relevantProjects`, `relevantOutcomes`, `gapsOrUnknowns`, and
`suggestedFollowups`. General Q&A uses `mode: "ask"` and should not render a fit
badge. Fit and JD responses use `mode: "fit"` and may render the four-value fit
badge defined in `AGENTS.md`.

There are no numeric scores. The agent must never produce a match percentage,
rating, or 0-10 fit number.

## Files

- `types.ts` defines the request/response and SSE event shapes shared with the UI.
- `profileContext.ts` serializes the structured profile sections for the context
  selector agent.
- `retrieval.ts` exposes local evidence retrieval helpers used by the answer
  agent's tools.

## Pipeline

`src/app/api/agent/route.ts` runs a compact multi-step pipeline:

1. Detect a URL in the latest user message.
2. If a URL exists, create a structured public company brief with web search.
3. Use the context selector to classify intent and summarize relevant profile
   sections.
4. Use the answer agent to produce a schema-validated `AgentResponse`.
5. Stream `status`, `delta`, and `final` events back to `/chat`.

Profile claims must come from the structured profile data, retrieval tools, or the
conversation. Company facts must come from the websearch brief and should be cited
at the end of `answerText` when they materially affect a fit assessment.
