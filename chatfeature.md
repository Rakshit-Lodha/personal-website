# Chat Feature

## Overview

The portfolio now has a standalone `/chat` page for recruiters, founders, and hiring managers to evaluate Rakshit Lodha against a role or ask general questions about his experience.

The feature supports two modes through one interface:

- **JD / role-fit evaluation:** users paste or upload a job description and receive a structured fit assessment.
- **General Q&A:** users can ask conversational questions about Rakshit's background, projects, outcomes, skills, and work style.

The agent does not force every response into a fit score. Fit scores are only shown when the visitor provides a role/JD context or explicitly asks about fit.

## User Experience

- Route: `/chat`
- Visual direction: clean Apple-like UI with warm off-white background, near-black type, blue accents, soft cards, subtle borders, and spacious layout.
- Desktop layout: two columns with explanatory content on the left and a sticky chat card on the right.
- Mobile layout: stacked content with responsive nav and a full-width chat card.
- The chat card stays fixed on desktop and the message area scrolls internally.
- The upload/dropzone is placed in the chat composer area so it stays near the input and does not consume chat history space.

## Core Files

- `src/app/chat/page.tsx`: standalone chat page UI and client-side chat state.
- `src/app/api/agent/route.ts`: OpenAI Agents SDK route for live AI responses.
- `src/app/api/parse-jd/route.ts`: PDF, DOCX, and TXT job-description parsing route.
- `src/lib/agent/retrieval.ts`: local profile retrieval helpers over structured profile data.
- `src/lib/agent/types.ts`: shared agent response and stream event types.
- `src/lib/profile/*`: structured source-of-truth data for identity, experience, projects, education, fit evidence, and technical evidence.

## Agent Behavior

- Uses the OpenAI Agents SDK with `OPENAI_API_KEY`.
- Defaults to `gpt-5.5` through `OPENAI_AGENT_MODEL || "gpt-5.5"`.
- Calls local profile tools before answering.
- Uses only profile/project/evidence data available in the repo.
- Returns streamed chat text plus a final structured payload for evidence cards.
- Browser state carries the current conversation for follow-up questions.
- No server-side conversation storage or database persistence is used.

## Upload Behavior

- Supported formats: PDF, DOCX, TXT.
- Max file size: 10MB.
- TXT files are parsed directly.
- PDF text extraction uses `pdf-parse`.
- DOCX text extraction uses `mammoth`.
- Extracted JD text is placed in the chat input for the user to review or send.

## Verification

The feature has been checked with:

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `/chat` route response check
- `/api/parse-jd` TXT upload parsing check
