# Personal Website — Rakshit Lodha

Personal site for **Rakshit Lodha**, AI Product Manager. The marketing surface (`/`) is intentionally minimal — the real product is at **`/chat`**, an AI hiring assistant that helps recruiters, founders, and hiring managers evaluate Rakshit against a company URL, a job description, or a free-form question.

Most of this README is about the chat feature: how the agent is wired, what context it sees, and why the architecture is the way it is.

Related docs in this repo:

- [`DESIGN.md`](./DESIGN.md) — visual and product spec for the site.
- [`AGENTS.md`](./AGENTS.md) — engineering constraints and definition of done.
- [`chatfeature.md`](./chatfeature.md) — chat feature spec and known gaps.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

`.env.local`:

```bash
OPENAI_API_KEY=sk-...            # required
OPENAI_AGENT_MODEL=gpt-5.5       # optional — main answer model
OPENAI_CONTEXT_MODEL=gpt-4o      # optional — profile context selector
OPENAI_WEBSEARCH_MODEL=gpt-4o    # optional — company websearch
```

Without `OPENAI_API_KEY`, `/api/agent` returns 500. The rest of the site still renders.

### Scripts

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build
npm run lint     # ESLint
node node_modules/typescript/lib/tsc.js --noEmit   # type check
```

(Use the explicit `tsc` path — a stray `~/package-lock.json` on the dev machine breaks `npx tsc`.)

### Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5 · Tailwind v4 · shadcn/ui · Framer Motion · OpenAI Agents SDK · Zod · `pdf-parse` / `mammoth` for uploads.

---

## The chat feature

`/chat` is a single-column, ChatGPT-style page. One interface, three modes — the agent classifies intent and switches behavior automatically:

1. **Company URL fit check.** Paste a URL, ask "is Rakshit a fit?" — the backend researches the company on the public web first, then assesses fit against Rakshit's profile.
2. **JD / role-fit evaluation.** Paste text or drop a PDF / DOCX / TXT (≤10 MB). The agent returns a structured fit assessment.
3. **General Q&A.** Background, projects, outcomes, work style. No fit framing forced onto general questions.

**No scores.** The agent is explicitly prohibited from returning match percentages, ratings, or 0–10 numbers. Fit is a 4-value enum — `Strong fit`, `Relevant fit`, `Partial fit`, `Not enough evidence` — and the UI shows it as a single pill badge (spec lives in `AGENTS.md`; pill rendering is not yet wired in).

### Conversation persistence

There is no server-side conversation store and no database. Browser state carries the full transcript and re-sends it on each turn (`messages: max 40, each ≤8000 chars`). This keeps the deployment surface tiny — the site is a static Next.js app plus one streaming route.

---

## Agent architecture

The `/api/agent` route is a Node runtime route that **streams** newline-delimited SSE events back to the browser:

```
status   →  "Researching company website"
status   →  "Reading profile context"
status   →  "Summarizing relevant context"
status   →  "Drafting brief"
delta    →  "Rakshit has shipped…"   (~42-char chunks, 18 ms apart)
delta    →  "…RAG eval pipelines…"
final    →  { full AgentResponse JSON — fitLevel, headline, proofPoints, … }
```

Under the hood it's a **3-stage pipeline of OpenAI Agents SDK agents**, not a single monolithic call:

```
┌──────────────────────────┐
│  1. URL detection (regex)│
│     extractFirstUrl()    │
└──────────┬───────────────┘
           │ URL present?
           ▼
┌──────────────────────────────────────────────────────┐
│  2. websearch  (gpt-4o + OpenAI Responses API)       │
│     Built-in web_search tool, search_context_size=low│
│     Output: structured CompanyBrief (Zod-validated)  │
└──────────┬───────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────┐
│  3. contextAgent  (gpt-4o)                           │
│     Sees: full conversation + ALL profile sections   │
│            + company brief (if any)                  │
│     Picks relevant sections, writes a compact brief, │
│     classifies responseType: qa | fitment | both     │
│     Output: ContextBriefSchema (Zod)                 │
└──────────┬───────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────┐
│  4. rakshitAgent  (gpt-5.5)                          │
│     Sees: context brief + conversation + company     │
│     Tools: search_profile_evidence, get_project_     │
│            details, get_experience_outcomes,         │
│            get_identity_context, websearch           │
│     Output: AgentResponse (Zod, 12 fields)           │
│     maxTurns: 6                                      │
└──────────────────────────────────────────────────────┘
```

### Why the two-agent split

The naive thing would be one big agent with all the profile data and all the tools. Two reasons we don't do that:

- **Context discipline.** ~32 KB of profile JSON is a lot to drag through every reasoning step. The context agent reads it once and produces a small brief; the answer agent reasons on the brief plus targeted tool calls.
- **Classification is its own job.** Deciding *qa vs fitment vs both* upstream gives the answer agent a cleaner prompt and stops it from forcing strengths/gaps framing onto a "where did he go to school?" question.

### Every output is schema-validated

Three Zod schemas gate the pipeline — invalid outputs throw before they reach the user:

| Stage      | Schema                | Notable fields |
|------------|-----------------------|----------------|
| Websearch  | `CompanyBriefSchema`  | `companyName`, `productAreas[≤6]`, `businessModel`, `targetUsers[≤6]`, `hiringOrProductSignals[≤6]`, `fitRelevantContext[≤6]`, `openQuestions[≤5]`, `sources[≤6]` |
| Context    | `ContextBriefSchema`  | `responseType`, `selectedSections[≤6]`, `contextBrief`, `missingEvidence[≤5]` |
| Answer     | `AgentResponseSchema` | `responseType`, `mode`, `headline`, `fitLevel`, `summary`, `answerText`, `proofPoints[≤6]`, `relevantProjects[≤5]`, `relevantOutcomes[≤6]`, `gapsOrUnknowns[≤4]`, `suggestedFollowups[≤4]`, `cta` |

### Tools the answer agent can call

All five are defined in `src/app/api/agent/route.ts` and back onto `src/lib/agent/retrieval.ts`:

| Tool | Purpose |
|------|---------|
| `search_profile_evidence(query, mode)` | Token-overlap search across fit evidence, technical evidence, projects, and experience outcomes. Falls back to featured items if no matches. |
| `get_project_details(projectIds?)`     | Full evidence for specific project IDs, or featured projects if none specified. |
| `get_experience_outcomes(query)`       | Search across flattened outcomes from every role, plus top matching companies. |
| `get_identity_context()`               | High-level identity, positioning, capabilities, tools, and education. |
| `websearch(companyUrl, userQuestion)`  | Re-runs the company brief if the answer agent decides it needs to. Skipped if a brief already exists. |

### Anti-hallucination rules baked into the prompt

The answer agent's system prompt is explicit:

- Use only facts from tools, the provided context, or the conversation.
- Do not combine separate facts into a new claim — if a tool appears only as a *general capability*, do not attach it to a named project unless the evidence explicitly links them.
- Do not invent employers, dates, metrics, links, technologies, or education.
- Missing evidence goes in `gapsOrUnknowns`, not made up.
- Company sources appear only at the end of `answerText` under a `Sources` markdown heading — never inline.

---

## What context the agent actually sees

The structured profile data the agent reasons over lives under `src/lib/profile/*` and is roughly **32 KB / 735 lines of TypeScript** across seven files. `serializeProfileSections()` ships all of it to the context agent on every turn:

| File | Lines | What's in it |
|------|------:|--------------|
| `identity.ts`            |  79 | Name, title, location, summary, positioning, work style, AI product capabilities, technical tools, personal signals, socials |
| `experience.ts`          | 148 | Every role (LearnApp, INDmoney, ET Money) with structured outcomes — each outcome has `label`, `metric`, `impact`, `evidence`, `themes` |
| `projects.ts`            | 210 | Featured projects (Krux.news, Feedback Agent, MF Semantic Search, US Stocks Agent, AI Eval Framework, TalkToKrishna) with descriptions, stack, links, role |
| `fitEvidence.ts`         | 120 | Role-fit themes — AI PM, fintech, 0-to-1, eval systems, agentic workflows, etc. |
| `technicalEvidence.ts`   | 112 | Specific technical / craft proof points mapped to tools, methods, and outcomes |
| `education.ts`           |  23 | SP Jain GSM, Christ University, LSE |
| `prompts.ts`             |   7 | Suggested chip prompts for the chat zero-state |

The aggregate is re-exported from `src/lib/profile/index.ts` as `PROFILE_DATA`.

**Update path:** to change what the agent knows, edit the relevant file under `src/lib/profile/`. To change what the homepage *renders*, edit `src/lib/resumeData.ts` (separate UI-shaped copy of the same content — kept split so the homepage stays decoupled from agent retrieval).

### How much context flows per turn

- **Context agent input** ≈ requested mode + full conversation + all 7 profile sections + (optional) formatted company brief.
- **Answer agent input** ≈ requested mode + classified response type + (optional) company brief with sources + selected section names + context brief + missing-evidence list + full conversation. **It does not get the raw 32 KB profile** — the context brief is the abstraction layer. It can still pull raw facts on demand via tools.

This is the deliberate trade: the context agent burns tokens on a wide read so the answer agent can stay narrow and on-task.

---

## Document upload (`/api/parse-jd`)

`POST /api/parse-jd` accepts a single `file` form field, max 10 MB. Returns `{ text }`.

- **TXT** — UTF-8 decode.
- **DOCX** — `mammoth.extractRawText`.
- **PDF** — `pdf-parse` (depends on `pdfjs-dist`).

### PDF parsing gotcha (read before touching)

`pdf-parse` v2.4.5 + Turbopack has two foot-guns. Both are documented in `AGENTS.md`:

1. **Worker bundling.** `pdfjs-dist` uses a web worker that Turbopack can't resolve at build time. `next.config.ts` sets `serverExternalPackages: ["pdf-parse", "pdfjs-dist"]` to load both via Node `require` at runtime. **Removing this silently breaks PDF uploads.**
2. **The correct import.** `pdf-parse` is a plain CJS function. There is no `PDFParse` named export and no class-based `.getText()` / `.destroy()` API. Use:
   ```ts
   // eslint-disable-next-line @typescript-eslint/no-require-imports
   const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
   const { text } = await pdfParse(buffer);
   ```
   The current `src/app/api/parse-jd/route.ts` still uses the broken class-based form and needs to be fixed — see the "Known issue" note in `chatfeature.md`.

---

## Project layout

```
src/
├── app/
│   ├── page.tsx                 # homepage (Hero, MyStory, Projects, ClosingSection)
│   ├── chat/page.tsx            # /chat — zero-state, thread, composer, upload chip
│   └── api/
│       ├── agent/route.ts       # the 3-stage agent pipeline + SSE stream
│       └── parse-jd/route.ts    # PDF / DOCX / TXT extraction
├── components/                  # Nav, Hero, MyStory, Projects, ClosingSection, ChatPanel, ChatDrawer, ui/*
└── lib/
    ├── agent/
    │   ├── retrieval.ts         # token-overlap search over profile data
    │   ├── profileContext.ts    # serializes all profile sections for the context agent
    │   └── types.ts             # AgentResponse, AgentStreamEvent, AgentBrief
    ├── profile/                 # structured ground-truth (see table above)
    ├── resumeData.ts            # UI content for the homepage
    └── chatResponses.ts         # local deterministic fallback for offline/dev use
```

---

## Deployment

Vercel is the intended target. Set `OPENAI_API_KEY` (and any model overrides) in the project's environment. The agent route is Node-runtime (`export const runtime = "nodejs"`) because of the OpenAI SDK and `pdf-parse` — it will not run on the Edge runtime.

---

## License

Private — personal portfolio. Not licensed for reuse.
