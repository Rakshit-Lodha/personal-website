# Chat Feature

## Overview

The portfolio has a standalone `/chat` page for recruiters, founders, and hiring managers to evaluate Rakshit Lodha against a company, role, or JD, and to ask general questions about his experience.

The feature supports three modes through one interface:

- **Company URL fit check:** users paste a company URL and ask whether Rakshit is a relevant fit. The backend researches the public company context before answering.
- **JD / role-fit evaluation:** users paste or upload a job description and receive a fit assessment.
- **General Q&A:** users ask conversational questions about Rakshit's background, projects, outcomes, skills, and work style.

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

## Main Page Funnel

- Homepage hero "Chat with my AI" links directly to `/chat`.
- CTA section "Chat with me" also links directly to `/chat`.
- The old homepage chat drawer state has been removed from `src/app/page.tsx`.
- Main social links and project GitHub links have been corrected so the site funnel is consistent.

## Core Files

- `src/app/chat/page.tsx`: standalone chat page UI, zero-state, message thread, composer, upload chip, and client-side stream handling.
- `src/app/api/agent/route.ts`: OpenAI Agents SDK route for live AI responses, company URL detection, websearch, profile context selection, and streamed SSE output.
- `src/app/api/parse-jd/route.ts`: PDF, DOCX, and TXT job-description parsing route.
- `src/lib/agent/retrieval.ts`: local profile retrieval helpers over structured profile data.
- `src/lib/agent/types.ts`: shared agent response and stream event types.
- `src/lib/profile/*`: structured source-of-truth data for identity, experience, projects, education, fit evidence, technical evidence, and project links.
- `public/rakshit-avatar.jpeg`: local avatar used in the chat zero-state.

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
- PDF text extraction uses `pdf-parse`.
- DOCX text extraction uses `mammoth`.
- Selected files appear as a chip above the composer.
- Users can send an empty message with only a file; the default prompt is "Assess fit against the attached job description."
- Dragging a file anywhere onto the page triggers the same upload flow.

## Project And Social Links

- LinkedIn: `https://www.linkedin.com/in/rakshit-lodha-360241187/`
- X: `https://x.com/rakshitlodha`
- GitHub: `https://github.com/Rakshit-Lodha`
- Project GitHub links are wired for Krux.news, Feedback Intelligence, MF Search, US Stocks Agent, AI Evaluation Framework, and TalkToKrishna.

## Verification

The feature has been checked with:

- `node node_modules/typescript/lib/tsc.js --noEmit`
- `npm run lint`
- `npm run build`
- `/chat` route response check
- `/api/parse-jd` TXT upload parsing check

Live websearch endpoint smoke tests require `OPENAI_API_KEY` to be available in the runtime environment.
