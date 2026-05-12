# Chat Feature

## Overview

The portfolio has a standalone `/chat` page for recruiters, founders, and hiring managers to evaluate Rakshit Lodha against a company, role, or JD, and to ask general questions about his experience.

The feature supports three modes through one interface:

- **Company URL fit check:** users paste a company URL and ask whether Rakshit is a relevant fit. The backend researches the public company context before answering.
- **JD / role-fit evaluation:** users paste or upload a job description and receive a fit assessment.
- **General Q&A:** users ask conversational questions about Rakshit's background, projects, outcomes, skills, and work style.
- **Voice input:** users can record a short voice prompt from the composer. The browser sends the audio to Sarvam speech-to-text and inserts the transcript into the text input for review before sending.
- **Spoken responses:** assistant responses include a speaker control that uses Sarvam text-to-speech to read the answer aloud.

The agent must not produce match scores, ratings, percentages, or 0-10 fit numbers. Fit answers should be evidence-led and honest about gaps.

## User Experience

- Route: `/chat`.
- Layout: single-column ChatGPT-style interface.
- Top nav: reuses the main site `Nav` component for consistency.
- Main content: scrollable zero-state or conversation thread.
- Bottom composer: always visible at the bottom of the viewport.
- Disclosure: "Responses are AI-generated and may be wrong."
- Zero-state: circular Rakshit avatar, short intro, and four vertically stacked prompt chips.
- Prompt chips submit immediately. They do not prefill the input.
- First send unmounts the zero-state and mounts the conversation thread.
- No mock conversations, fake scores, feature cards, sidebars, or split marketing layout.

## Fit Badge

**Not yet implemented.** The agent returns `fitLevel`, `proofPoints`, `relevantProjects`, etc. in the `final` SSE event, but the current chat UI only renders `answerText` as markdown. The structured fields are received and stored on the assistant message but not displayed.

When implemented, the spec is:
- Render a pill badge below the answer text for fit/JD responses only.
- Badge shows one of four values: `Strong fit`, `Relevant fit`, `Partial fit`, `Not enough evidence`.
- Color coding: green / blue / amber / gray respectively.
- General Q&A responses (`mode: "ask"`) never show the badge.
- The badge is the entire fit UI — no proof points, gaps list, or follow-up chips.

## Main Page Funnel

- Homepage hero "Chat with my AI" links directly to `/chat`.
- CTA section "Chat with me" also links directly to `/chat`.
- The old homepage chat drawer state has been removed from `src/app/page.tsx`.
- Main social links and project GitHub links have been corrected so the site funnel is consistent.

## Core Files

- `src/app/chat/page.tsx`: standalone chat page UI, zero-state, message thread, composer, upload chip, and client-side stream handling. Fit badge is not yet rendered.
- `src/app/api/agent/route.ts`: OpenAI Agents SDK route for live AI responses, company URL detection, websearch, profile context selection, and streamed SSE output.
- `src/app/api/parse-jd/route.ts`: PDF, DOCX, and TXT job-description parsing route.
- `src/app/api/transcribe/route.ts`: Sarvam speech-to-text route for short microphone recordings. Requires `SARVAM_API_KEY` or `SARVAM_API_SUBSCRIPTION_KEY`.
- `src/app/api/speak/route.ts`: Sarvam text-to-speech route for assistant response playback. Requires `SARVAM_API_KEY` or `SARVAM_API_SUBSCRIPTION_KEY`.
- `src/lib/agent/retrieval.ts`: local profile retrieval helpers over structured profile data.
- `src/lib/agent/types.ts`: shared agent response and stream event types.
- `src/lib/profile/*`: structured source-of-truth data for identity, experience, projects, education, fit evidence, technical evidence, and project links.
- `public/rakshit-avatar.jpeg`: local avatar used in the chat zero-state.
- `next.config.ts`: sets `serverExternalPackages: ["pdf-parse", "pdfjs-dist"]` — required for PDF parsing to work under Turbopack.

## Agent Behavior

- Uses the OpenAI Agents SDK with `OPENAI_API_KEY`.
- Main answer model defaults to `OPENAI_AGENT_MODEL || "gpt-5.5"`.
- Context selector defaults to `OPENAI_CONTEXT_MODEL || "gpt-4o"`.
- Company websearch defaults to `OPENAI_WEBSEARCH_MODEL || "gpt-4o"`.
- Calls local profile tools before answering.
- Uses only repo profile/project/evidence data for claims about Rakshit.
- Uses public websearch only for company context when a company URL is provided.
- Browser state carries the current conversation for follow-up questions.
- No server-side conversation storage or database persistence is used.
- The `final` SSE event carries the full `AgentResponse` struct. The client stores it on the assistant message. `fitLevel` and other structured fields are available but not yet rendered in the UI.

## Websearch Behavior

- A URL in the latest user message triggers company research automatically.
- The backend also registers an Agents SDK tool named `websearch`.
- `websearch` uses the OpenAI Responses API with the built-in web search tool.
- Output is a structured company brief: company name, summary, product areas, target users, business model, product/hiring signals, fit-relevant context, open questions, and sources.
- The company brief is passed into the main fit agent alongside Rakshit's profile context.
- Sources must not be dumped inline inside paragraphs. If used, they should appear only at the end under a markdown `Sources` heading as a bullet list.
- The UI streams status messages while slower research is running, such as "Researching company website", "Reading profile context", "Summarizing relevant context", and "Drafting brief".

## Upload Behavior

- Supported formats: PDF, DOCX, TXT.
- Max file size: 10MB.
- TXT files are parsed directly.
- PDF text extraction uses `pdf-parse` (depends on `pdfjs-dist`). `pdf-parse` is a plain CJS function — it has no class-based API. The correct usage is `require("pdf-parse")` returning `Promise<{ text }>`. See `AGENTS.md` for the full constraint and correct import pattern.
- DOCX text extraction uses `mammoth`.
- `serverExternalPackages: ["pdf-parse", "pdfjs-dist"]` in `next.config.ts` is required — without it Turbopack fails to resolve the pdfjs worker file at runtime.
- Selected files appear as a chip above the composer.
- Users can send an empty message with only a file; the default prompt is "Assess fit against the attached job description."
- Dragging a file anywhere onto the page triggers the same upload flow.

## Voice Input Behavior

- The composer mic button records browser audio with `MediaRecorder`.
- Clicking the mic starts recording; clicking the stop control ends recording and sends the clip to `/api/transcribe`.
- Recordings are capped at 30 seconds for Sarvam's interactive speech-to-text flow.
- The transcript is inserted into the composer and is not sent automatically, so users can review or edit before submitting.
- The Sarvam API key stays server-side. The route reads `SARVAM_API_KEY`, falling back to `SARVAM_API_SUBSCRIPTION_KEY`.

## Spoken Response Behavior

- Completed assistant messages render a speaker button at the end of the response card.
- Clicking the speaker button calls `/api/speak`, which converts the response text to WAV audio through Sarvam text-to-speech.
- The browser plays the returned audio directly and allows the same button to stop playback.
- The API route removes markdown formatting before speech generation and caps TTS input at Sarvam's `bulbul:v3` 2500-character limit.

## Project And Social Links

- LinkedIn: `https://www.linkedin.com/in/rakshit-lodha-360241187/`
- X: `https://x.com/rakshitlodha`
- GitHub: `https://github.com/Rakshit-Lodha`
- Project GitHub links are wired for Krux.news, Feedback Intelligence, MF Search, US Stocks Agent, AI Evaluation Framework, and TalkToKrishna.

## Verification

The feature has been checked with:

- `node node_modules/typescript/lib/tsc.js --noEmit`
- `npm run lint`
- `/chat` route response check
- `/api/parse-jd` TXT upload parsing check

**Known issue:** `/api/parse-jd` PDF parsing is currently broken. `src/app/api/parse-jd/route.ts` imports `{ PDFParse }` from `pdf-parse` and uses a class-based API (`.getText()`, `.destroy()`) that does not exist in the package. Fix by replacing with `require("pdf-parse")` and calling it as a plain function. See `AGENTS.md` for the correct pattern.

Live websearch endpoint smoke tests require `OPENAI_API_KEY` to be available in the runtime environment.
