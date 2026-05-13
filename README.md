# Agent Layer

This folder supports the `/chat` hiring assistant described in the root
`README.md`, `chatfeature.md`, and `AGENTS.md`.

The chat product is a single interface for three recruiter workflows:

- company URL fit checks with public company research
- JD / role-fit evaluation from pasted text or uploaded PDF, DOCX, or TXT files
- general Q&A about Rakshit's background, projects, outcomes, skills, and work style
- voice input through Sarvam speech-to-text, so users can dictate prompts into
  the composer before sending
- spoken assistant responses through Sarvam text-to-speech, so users can play an
  answer aloud from the response card

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

## Environment

`.env.local` should include:

```bash
OPENAI_API_KEY=sk-...                    # required for /api/agent
OPENAI_AGENT_MODEL=gpt-5.5               # optional main answer model
OPENAI_CONTEXT_MODEL=gpt-4o              # optional context selector model
OPENAI_WEBSEARCH_MODEL=gpt-4o            # optional company websearch model
SARVAM_API_KEY=...                       # required for voice input/output
```

`SARVAM_API_SUBSCRIPTION_KEY` is also supported as a fallback name for the Sarvam
key. Keep Sarvam keys server-side only; the browser talks to local API routes.

## Files

- `types.ts` defines the request/response and SSE event shapes shared with the UI.
- `profileContext.ts` serializes the structured profile sections for the context
  selector agent.
- `retrieval.ts` exposes local evidence retrieval helpers used by the answer
  agent's tools.
- `src/app/api/transcribe/route.ts` converts short microphone recordings to text
  with Sarvam speech-to-text.
- `src/app/api/speak/route.ts` converts assistant answer text to WAV audio with
  Sarvam text-to-speech.
- `src/app/api/parse-jd/route.ts` extracts text from uploaded PDF, DOCX, and TXT
  job descriptions.

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

## Voice Features

Voice input is handled by the `/chat` composer:

1. The user clicks the mic button.
2. The browser records audio with `MediaRecorder`.
3. The clip is posted to `src/app/api/transcribe/route.ts`.
4. Sarvam transcribes it with `saaras:v3`.
5. The transcript is inserted into the composer for review before sending.

Assistant response playback is handled by the speaker button at the end of each
completed assistant message:

1. The user clicks the speaker button.
2. The browser posts the response text to `src/app/api/speak/route.ts`.
3. Sarvam generates WAV audio with `bulbul:v3`.
4. The browser plays the returned audio and lets the same control stop playback.

The TTS route strips markdown formatting and caps input to Sarvam's `bulbul:v3`
2,500-character limit before synthesis.

## Verification

For chat and voice changes, run:

```bash
node node_modules/typescript/lib/tsc.js --noEmit
npm run lint
```

Useful smoke checks:

```bash
curl -s -X POST http://127.0.0.1:3000/api/transcribe -w '\n%{http_code}\n'
curl -s -X POST http://127.0.0.1:3000/api/speak \
  -H 'Content-Type: application/json' \
  -d '{"text":"Hello."}' \
  -o /tmp/sarvam-hello.wav \
  -w '%{http_code} %{content_type} %{size_download}\n'
```

The first command should return a `400` for malformed input. The second should
return `200 audio/wav` when `SARVAM_API_KEY` is configured.
