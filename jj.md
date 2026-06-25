# JJ Voice Agent Plan

JJ stands for Jarvis Junior: a voice-first agent that can answer questions about Rakshit Lodha, control the website visually, and control the music player.

The first milestone is a functional voice demo. UI polish for the orb, transcript, animations, and final visual identity comes after the mechanics work.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed
- `[!]` Blocked or needs decision

When starting a sub-task, change `[ ]` to `[~]`. When completed and verified, change `[~]` to `[x]` and add a short `Done:` note with what was tested.

## Product Goal

JJ should feel like a voice-native portfolio guide, not a spoken version of chat.

Core behavior:

- The user speaks naturally.
- JJ answers in voice.
- JJ retrieves only relevant portfolio evidence.
- JJ moves the page while speaking: scrolls, focuses, highlights, and opens the right project or experience.
- JJ controls the existing music player: play, pause, next, previous, play a specific track, open the player, and change music volume.
- JJ can distinguish between lowering JJ's voice volume and lowering the music volume.
- External links should only open when the user explicitly asks to open them.

## Architecture Direction

Use OpenAI Realtime speech-to-speech as the primary voice path for the Jarvis-like experience: low latency, interruption support, natural turn taking, and tool calls.

Use a RAG-based knowledge layer instead of sending the full profile context into every turn. JJ should retrieve compact, entity-aware chunks and then decide what to say and what commands to run.

High-level flow:

```txt
Browser mic
  -> OpenAI Realtime session
  -> JJ realtime agent
      -> retrieve_portfolio_context tool
      -> execute_site_command tool
      -> control_music tool
  -> Browser receives audio + command events
  -> Site action bus applies page/music commands
```

Fallback / later option:

<!-- ```txt
Browser mic
  -> Pipecat
  -> Sarvam STT
  -> OpenAI text agent + RAG + tools
  -> Sarvam TTS
  -> Browser audio
```

The fallback is useful if Sarvam voice quality becomes a hard requirement, but the first demo should prioritize realtime responsiveness. -->

## Key Repo References

Read these before implementing:

- `AGENTS.md` instructions from the conversation: PDF parsing config, agent models, SSE streaming, FitCard rules, and no numeric fit scores.
- `src/app/api/agent/route.ts` — current chat agent pipeline, intent planning, evidence gathering, SSE streaming, OpenAI Agents SDK usage.
- `src/lib/agent/prompts.ts` — current grounding, Q&A, fitment, and evidence rules.
- `src/lib/agent/retrieval.ts` — current structured profile retrieval logic.
- `src/lib/agent/types.ts` — current `AgentResponse` and SSE event types.
- `src/lib/profile/index.ts` — profile source selection and exports.
- `src/lib/profile/projects.ts` — project source data, IDs, links, summaries, proof points.
- `src/lib/profile/experience.ts` — ET Money, INDMoney, LearnApp source data, outcomes, failures.
- `src/lib/profile/technicalEvidence.ts` — technical/craft evidence source data.
- `src/lib/profile/education.ts` — education data.
- `src/lib/profile/hiringPreferences.ts` — preferences and constraints.
- `src/lib/profile/v2/deepEvidence.ts` — rich evidence entries for deeper Q&A.
- `src/lib/musicData.ts` — songs, IDs, audio paths, covers, lyrics timing.
- `src/components/music/MusicPlayerProvider.tsx` — existing shared music state and controls.
- `src/components/music/MusicChipDesktop.tsx` — desktop music player.
- `src/components/music/MusicStripMobile.tsx` — mobile music strip.
- `src/components/music/MusicSheet.tsx` — mobile/full player sheet.
- `src/components/LandingNav.tsx` — fixed nav, section active state, desktop music chip placement.
- `src/app/page.tsx` — home composition and current music provider mounting.
- `src/app/chat/page.tsx` — current chat UI and client-side streaming behavior.
- `src/app/api/transcribe/route.ts` — current Sarvam STT route.
- `src/app/api/speak/route.ts` — current Sarvam TTS route.
- `MUSIC_PLAYER_PLAN.md` — current state of the music player and known mobile gaps.

OpenAI docs to check before implementation:

- OpenAI Realtime API guide.
- OpenAI voice agents guide.
- OpenAI embeddings guide.
- OpenAI Responses / tool calling docs as needed.

## Core Types

### Site Commands

The website should expose intentional commands. JJ should not directly manipulate random DOM nodes.

```ts
type SiteCommand =
  | { type: "scroll_to_section"; sectionId: "hero" | "my-story" | "projects" | "skills" | "education" }
  | { type: "focus_project"; projectId: string }
  | { type: "highlight_project"; projectId: string }
  | { type: "open_project_link"; projectId: string; linkType: "github" | "demo" | "caseStudy" }
  | { type: "focus_experience"; companyId: "etmoney" | "indmoney" | "learnapp" }
  | { type: "highlight_outcome"; outcomeId: string }
  | { type: "music_play" }
  | { type: "music_pause" }
  | { type: "music_next" }
  | { type: "music_previous" }
  | { type: "music_play_track"; songId: string }
  | { type: "music_set_volume"; volume: number }
  | { type: "agent_set_volume"; volume: number }
  | { type: "open_music_player" }
  | { type: "close_music_player" };
```

### Knowledge Chunk

Chunks should be entity-first, not paragraph-first.

```ts
type KnowledgeChunk = {
  id: string;
  entityType:
    | "project"
    | "experience"
    | "outcome"
    | "failure"
    | "skill"
    | "song"
    | "navigation";
  entityId: string;
  parentId?: string;
  title: string;
  aliases: string[];
  retrievalText: string;
  speechSummary: string;
  facts: string[];
  metadata: {
    source: "profile" | "music" | "site";
    sectionId?: "hero" | "my-story" | "projects" | "skills" | "education";
    pageAnchor?: string;
    visibleOnPage: boolean;
    companyId?: "etmoney" | "indmoney" | "learnapp";
    projectId?: string;
    outcomeId?: string;
    songId?: string;
    workContext?: "professional" | "personal_project" | "education" | "music" | "site_navigation";
    evidenceStrength?: "direct_shipped" | "direct_claim" | "adjacent" | "generic";
    tags: string[];
    priority: number;
    links?: {
      github?: string;
      demo?: string;
      caseStudy?: string;
    };
  };
  preferredCommands: SiteCommand[];
};
```

## Music Meaning Map

Each song is tied to a specific part of Rakshit's life and portfolio. JJ should treat songs as meaningful contextual anchors, not just generic tracks.

When generating song knowledge chunks, include these mappings in `retrievalText`, `speechSummary`, `facts`, `aliases`, `metadata.tags`, and `preferredCommands`.

| Song | Song ID | Life / Portfolio Anchor | Style |
| --- | --- | --- | --- |
| Open It Up | `open-it-up` | Projects | Rap, Eminem-style rap |
| What Good Looks Like | `what-good-looks-like` | ET Money | Rap, boom bap, hip hop |
| Closer to the Choice | `closer-to-the-choice` | INDMoney | Rock, hard rock, arena rock |
| Make it to the End | `make-it-to-the-end` | LearnApp | Acoustic rock, indie rock, energetic rock |

Expected JJ behavior:

- If the user asks for music related to projects, JJ should suggest or play `open-it-up`.
- If the user asks about ET Money and also asks for the related song/music, JJ should use `what-good-looks-like`.
- If the user asks about INDMoney and also asks for the related song/music, JJ should use `closer-to-the-choice`.
- If the user asks about LearnApp and also asks for the related song/music, JJ should use `make-it-to-the-end`.
- If the user asks "play something from that phase" after JJ has focused an experience/project, JJ should use the most recent focused entity to choose the mapped song.
- If the user simply asks "play music" with no context, JJ can default to the current playlist order or the currently selected song.
- JJ should not automatically start contextual music while answering unless the user asks to play music.

Sample song chunk:

```ts
{
  id: "song:what-good-looks-like",
  entityType: "song",
  entityId: "what-good-looks-like",
  title: "What Good Looks Like",
  aliases: [
    "what good looks like",
    "ET Money song",
    "ET Money track",
    "boom bap song",
    "hip hop song",
    "rap song for ET Money"
  ],
  retrievalText:
    "What Good Looks Like is the song tied to Rakshit's ET Money phase. It represents the ET Money journey and is styled as rap, boom bap, and hip hop.",
  speechSummary:
    "What Good Looks Like is the ET Money track. It has a rap, boom bap, hip hop feel.",
  facts: [
    "Mapped to Rakshit's ET Money phase.",
    "Style: rap, boom bap, hip hop.",
    "Available in the website music player."
  ],
  metadata: {
    source: "music",
    visibleOnPage: true,
    songId: "what-good-looks-like",
    companyId: "etmoney",
    workContext: "music",
    evidenceStrength: "direct_claim",
    tags: ["music", "song", "ET Money", "rap", "boom bap", "hip hop"],
    priority: 100
  },
  preferredCommands: [
    { type: "music_play_track", songId: "what-good-looks-like" },
    { type: "open_music_player" }
  ]
}
```

### Embedded Chunk

```ts
type EmbeddedKnowledgeChunk = KnowledgeChunk & {
  embedding: number[];
};
```

### Retrieval Result

```ts
type RetrievalResult = {
  query: string;
  selected: {
    chunkId: string;
    relevance: "high" | "medium" | "low";
    reason: string;
    useForAnswer: boolean;
    useForAction: boolean;
    suggestedCommands: SiteCommand[];
  }[];
  rejected: {
    chunkId: string;
    reason: string;
  }[];
  missingEvidence: string[];
};
```

## Implementation Phases

### Phase 1 — JJ Contract

- [x] Create `src/lib/jj/commands.ts`
  - Define `SiteCommand`.
  - Define command validation helpers.
  - Define explicit-open rules for external links.
  - Done: added command union, validation, ID normalization, volume clamping, and external-open intent guard; verified with TypeScript.

- [x] Create `src/lib/jj/knowledgeTypes.ts`
  - Define `KnowledgeChunk`, `EmbeddedKnowledgeChunk`, `RetrievalResult`, and eval case types.
  - Done: added knowledge, embedded chunk, retrieval result, and retrieval eval case/result types; verified with TypeScript.

- [x] Create `src/lib/jj/entities.ts`
  - Export canonical IDs for sections, companies, project IDs, outcome IDs, and song IDs.
  - Keep IDs aligned with `src/lib/profile/*` and `src/lib/musicData.ts`.
  - Done: exports canonical section/company/project/outcome/song IDs from existing profile/music sources plus aliases for page-facing naming differences.

- [x] Create `src/lib/jj/voiceTypes.ts`
  - Define JJ turn states and event types for the functional demo.
  - Include states: `idle`, `listening`, `thinking`, `speaking`, `executing`, `interrupted`, `error`.
  - Done: added turn states, voice event types, and session status type; verified with TypeScript.

Acceptance criteria:

- TypeScript types compile.
- Commands cover page navigation, project actions, experience actions, music controls, and agent volume.
- IDs match existing profile/music data.

### Phase 2 — Site Action Bus

- [x] Create `src/components/jj/SiteActionProvider.tsx`
  - Provide a `dispatchSiteCommand(command)` function.
  - Make it available to JJ demo components.
  - Done: added React provider, `useSiteActions`, agent volume state, and a temporary `window.__JJ_DISPATCH_SITE_COMMAND__` hook for local command testing.

- [x] Create `src/lib/jj/commandHandlers.ts`
  - Implement command handling for section scroll.
  - Implement project focus/highlight.
  - Implement experience focus/highlight.
  - Implement outcome highlight.
  - Implement external link opening with explicit-intent guard.
  - Done: implemented scroll/focus/highlight/link/music/agent-volume command handling with validation and explicit-open guard.

- [x] Add stable DOM targets to visible sections/cards
  - Section IDs: `hero`, `my-story`, `projects`, `skill-map`, `education`.
  - Project cards should expose stable IDs or data attributes by project ID.
  - Experience/outcome areas should expose stable IDs or data attributes by company/outcome ID.
  - Done: existing sections confirmed; project cards now expose canonical profile project IDs, story cards expose company IDs, and visible outcome rows expose canonical outcome IDs.

- [x] Connect SiteActionProvider to `src/app/page.tsx`
  - Wrap the page so JJ commands can reach page and music state.
  - Done: home page is wrapped in `SiteActionProvider` inside `MusicPlayerProvider`.

- [x] Extend music command support
  - Expose `play`, `pause`, `next`, `prev`, `setSong`, `setVolume`, `openSheet`, and `closeSheet` through the site action layer.
  - Add a way to play a track by song ID.
  - Done: site action layer maps music commands to existing `useMusic` controls and plays tracks by canonical song ID.

Acceptance criteria:

- Local code can dispatch a command and scroll to each section.
- Local code can highlight a project.
- Local code can focus an experience/outcome.
- Local code can play, pause, skip, set volume, and play a specific song.
- External links open only through explicit open commands.

### Phase 3 — Functional Voice Demo Shell

This phase intentionally avoids final UI polish.

- [x] Create a minimal JJ demo component
  - Suggested file: `src/components/jj/JJVoiceDemo.tsx`.
  - Button: start/stop voice session.
  - Minimal visible status: listening/thinking/speaking/error.
  - Minimal transcript display is allowed for debugging.
  - Done: added fixed demo control with start/stop button, state display, error display, and lightweight transcript debug area.

- [x] Create a realtime session route
  - Suggested file: `src/app/api/jj/session/route.ts`.
  - Mint an ephemeral/session token for the browser.
  - Keep server secrets off the client.
  - Done: added server route that mints OpenAI Realtime client secrets from `OPENAI_API_KEY`; verified route types compile.

- [x] Wire browser mic to OpenAI Realtime
  - Start session from demo button.
  - Stream mic audio.
  - Play JJ audio response.
  - Handle interruption/barge-in if supported by selected realtime client flow.
  - Done: demo creates a WebRTC peer connection, streams microphone audio, attaches remote audio playback, and opens a data channel for Realtime events. Full manual voice QA still requires a runtime `OPENAI_API_KEY`.

- [~] Add initial realtime tools
  - `execute_site_command`
  - `control_music`
  - `retrieve_portfolio_context` can initially return non-embedded chunks from Phase 4 if embeddings are not ready yet.
  - Done: session declares all three tools and the client handles command/music tool calls. `retrieve_portfolio_context` currently returns a placeholder until Phase 4 chunks exist.

- [x] Mount demo on the home page
  - Keep it simple and functional.
  - Do not polish final orb/UI yet.
  - Done: `JJVoiceDemo` is mounted on the home page inside the site action provider.

Acceptance criteria:

- User can talk to JJ from the page.
- JJ can speak back.
- JJ can run at least one page command.
- JJ can run at least one music command.
- No API keys are exposed to the browser.

### Phase 4 — Static Knowledge Chunks

- [x] Create `src/lib/jj/buildKnowledgeChunks.ts`
  - Convert profile and music data into `KnowledgeChunk[]`.
  - Generate chunks for projects.
  - Generate chunks for professional experiences.
  - Generate chunks for outcomes.
  - Generate chunks for failures.
  - Generate chunks for songs.
  - Add life/portfolio mappings for songs from the Music Meaning Map.
  - Generate chunks for navigation destinations.
  - Done: added runtime static chunk builder covering all profile projects, experiences, outcomes, INDMoney failures, technical skill themes, music tracks, and navigation destinations. Krux aliases include `Krux`, `Crux`, `Krux.news`, `Crux.news`, and `AI Times`.
  - Done: generated and validated committed chunk output with 36 chunks.

- [x] Create generated chunk file
  - Suggested file: `src/lib/jj/generated/knowledge-chunks.json`.
  - Commit generated output.
  - Done: generated `src/lib/jj/generated/knowledge-chunks.json` via `scripts/build-jj-chunks.mjs`.

- [x] Add chunk generation script
  - Suggested file: `scripts/build-jj-chunks.ts`.
  - Add npm script: `build:jj-chunks`.
  - Done: added `scripts/build-jj-chunks.mjs` and npm script `build:jj-chunks`.

- [x] Add validation
  - Every chunk must have `id`, `entityType`, `title`, `retrievalText`, `speechSummary`, `metadata.tags`, and `preferredCommands`.
  - Project chunks with links must preserve GitHub/demo URLs.
  - Song chunks must map to real song IDs from `src/lib/musicData.ts`.
  - Song chunks must include mapped life/portfolio anchor and style tags.
  - Done: chunk script validates required fields, duplicate IDs, project links, song IDs, and song style context before writing JSON.

Acceptance criteria:

- Generated chunks include all featured projects.
- Generated chunks include ET Money, INDMoney, LearnApp.
- Generated chunks include all outcomes.
- Generated chunks include all music tracks.
- Generated song chunks include project/experience associations and music styles.
- Generated chunks can be imported server-side.

### Phase 5 — OpenAI Embeddings Index

- [x] Create `scripts/build-jj-index.ts`
  - Read generated `KnowledgeChunk[]`.
  - Build embedding text with title, aliases, entity type, retrieval text, facts, tags, and IDs.
  - Call OpenAI embeddings model.
  - Write `src/lib/jj/generated/portfolio-index.json`.
  - Done: added `scripts/build-jj-index.mjs`, embedded all 36 chunks, and wrote `src/lib/jj/generated/portfolio-index.json`.

- [x] Use `text-embedding-3-small` for v1
  - Keep model configurable via `OPENAI_EMBEDDING_MODEL`.
  - Done: defaults to `text-embedding-3-small`, configurable by `OPENAI_EMBEDDING_MODEL`.

- [x] Commit generated index
  - Production should use the committed index.
  - Do not require embedding generation during deployment.
  - Done: generated index is committed-ready and retrieval imports the generated JSON instead of rebuilding during runtime.

- [x] Add index freshness note
  - Document that profile/music changes require regenerating and committing the index.
  - Done: this plan now records that profile/music changes require running `npm run build:jj-chunks` and `npm run build:jj-index`, then committing both generated files.

Acceptance criteria:

- Index builds locally with `OPENAI_API_KEY`.
- Generated index contains one embedding per chunk.
- Next.js can import or server-read the index in production.
- No client bundle exposes raw embeddings unless explicitly needed. Prefer server-side retrieval.

### Phase 6 — Retrieval + LLM Reranking

- [x] Create `src/lib/jj/retrieval.ts`
  - Embed query.
  - Run cosine similarity against static index.
  - Return top 10-12 candidates.
  - Apply metadata boosts for exact entity matches, company names, project names, song names, and command-like intents.
  - Done: added non-embedding static retrieval with alias/entity boosts, lexical scoring, command fast paths, and `/api/jj/retrieve`. Verified `Krux` and `Crux` both return `project:krux-new` as the top high-relevance chunk.
  - Done: upgraded retrieval to embed the query server-side, cosine-rank against the committed portfolio index, and blend embedding similarity with alias/lexical boosts.

- [x] Create `src/lib/jj/rerank.ts`
  - Send top candidates to a small/fast OpenAI model.
  - Return best 3-6 chunks with reasons.
  - Include suggested commands.
  - Do not write final answer in the reranker.
  - Done: added JSON-only reranker using `OPENAI_JJ_RERANK_MODEL`, falling back to `OPENAI_CONTEXT_MODEL` and then `gpt-4o`; returns selected/rejected chunks, reasons, and action flags without writing the final answer.

- [x] Add command fast path
  - Skip RAG for pure commands: pause music, play music, next song, scroll to projects, open player.
  - Use deterministic parsing for obvious commands where possible.
  - Done: added deterministic command classification for pure music/page commands, plus contextual company-to-song commands like ET Money -> `what-good-looks-like`.

- [x] Add retrieval API/tool
  - Suggested server helper: `retrievePortfolioContext(query)`.
  - Realtime tool should call this helper.
  - Done: added async `retrievePortfolioContext(query)`, `/api/jj/retrieve`, and wired Realtime `retrieve_portfolio_context` calls through that API.

Acceptance criteria:

- Query for INDMoney returns INDMoney experience and outcomes.
- Query for ET Money support automation returns ET Money support automation outcome.
- Query for agentic AI returns US Stocks Analysis Agent, Feedback Intelligence, and/or AI Hiring Chat.
- Query for a song returns the correct song chunk.
- Pure music commands do not waste a RAG call.

### Phase 7 — Retrieval Evals

- [x] Create `src/lib/jj/evals/retrievalCases.ts`
  - Include expected chunks.
  - Include acceptable chunks.
  - Include forbidden chunks.
  - Include expected commands.
  - Done: added cases for Krux, Crux ASR confusion, semantic Krux, INDMoney, ET Money support automation, agentic AI, ET Money song mapping, and pure commands.

- [x] Create `src/lib/jj/evals/runRetrievalEval.ts`
  - Run vector recall.
  - Run reranker.
  - Score retrieval results.
  - Done: eval runner checks vector@10, reranked selected chunks, rejected chunks, forbidden hits, and expected command matching.

- [x] Track metrics
  - Recall@10 before rerank.
  - Precision@5 after rerank.
  - MRR.
  - Forbidden hit rate.
  - Command accuracy.
  - Reranker selected/rejected accuracy.
  - Done: script prints per-case results plus aggregate recall@10, precision@5, MRR, forbidden hit rate, and command accuracy.

- [x] Add npm script
  - Suggested: `eval:jj-retrieval`.
  - Done: added `eval:jj-retrieval`.

Acceptance criteria:

- Eval script prints per-case results.
- Eval script prints aggregate metrics.
- Failures show retrieved chunks, selected chunks, rejected chunks, and reasons.
  - Done: `eval:jj-retrieval` passed 9/9 cases. Aggregate: Recall@10 1.0, Precision@5 0.4, MRR 0.905, forbidden hit rate 0, command accuracy 1.0.

### Phase 8 — Realtime JJ Agent Integration

- [ ] Create `src/lib/jj/realtimeAgent.ts`
  - Define JJ voice instructions.
  - Keep prompt small.
  - Use retrieval tool for facts.
  - Use command tools for actions.
  - Enforce no hallucinated metrics and no numeric fit scores.

- [ ] Tool: `retrieve_portfolio_context`
  - Input: user query.
  - Output: selected chunks, summaries, facts, and preferred commands.

- [ ] Tool: `execute_site_command`
  - Input: one or more `SiteCommand`.
  - Output: command acknowledgement.

- [ ] Tool: `control_music`
  - Input: music command.
  - Output: command acknowledgement.

- [ ] Tool: `open_project_link`
  - Only when user explicitly requests opening a GitHub/demo/case-study link.

- [ ] Connect realtime tool events to SiteActionProvider
  - Browser receives tool/action event.
  - Dispatches command locally.

Acceptance criteria:

- JJ can answer a profile question with retrieved evidence.
- JJ can move the page while speaking.
- JJ can control the music player by voice.
- JJ does not open external links unless asked explicitly.
- JJ says when evidence is missing rather than inventing.

### Phase 9 — Functional Demo QA

- [x] Run TypeScript
  - `node node_modules/typescript/lib/tsc.js --noEmit`
  - Done: passed using bundled Node at `/Users/rakshitlodha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`.

- [x] Run lint
  - `npm run lint`
  - Done: source lint passed by invoking local ESLint with bundled Node because this shell has no `npm` binary. Added `scripts/**/venv/**` to ESLint ignores so generated Python virtualenv JS is not linted.

- [ ] Run retrieval evals
  - `npm run eval:jj-retrieval`

- [ ] Manual voice smoke test
  - Use the browser demo.
  - Test page commands.
  - Test music commands.
  - Test profile questions.

Acceptance criteria:

- Functional voice demo works end to end.
- Known UI rough edges are documented.
- No final JJ visual polish is required in this milestone.

### Phase 10 — UI Polish Later

Do not start until the functional voice demo is working.

- [ ] Design final JJ entry point.
- [ ] Decide orb placement relative to nav/music chip.
- [ ] Add polished voice states.
- [ ] Add transcript treatment.
- [ ] Add visual feedback for command execution.
- [ ] Add mobile-specific layout and interaction.
- [ ] Add accessibility polish.

## Test Cases

### Voice Session

- [ ] User can start JJ voice session.
- [ ] User can stop JJ voice session.
- [ ] Browser asks for microphone permission.
- [ ] Missing mic permission shows a useful error.
- [ ] Missing `OPENAI_API_KEY` shows a useful server error.
- [ ] No OpenAI secret is exposed to the browser.
- [ ] JJ speaks a response.
- [ ] User can interrupt JJ while it is speaking.
- [ ] JJ recovers after interruption.
- [ ] Session can reconnect after network failure.

### Navigation Commands

- [ ] "Show me the projects" scrolls to projects.
- [ ] "Go to my story" scrolls to My Story.
- [ ] "Show me the skills" scrolls to Skill Map.
- [ ] "Go to education" scrolls to Education.
- [ ] "Back to the top" scrolls to Hero.
- [ ] Scroll commands work while music is playing.
- [ ] Scroll commands work while JJ is speaking.

### Project Commands

- [ ] "Show me the US Stocks Analysis Agent" focuses the US Stocks project.
- [ ] "Which project shows agentic AI?" retrieves and focuses a relevant agentic AI project.
- [ ] "Show the hiring chat project" focuses AI Hiring Chat.
- [ ] "Show Feedback Intelligence" focuses Feedback Intelligence.
- [ ] "Open the GitHub for that project" opens the selected project's GitHub only after explicit request.
- [ ] "Open the demo" opens the selected project's demo only after explicit request.
- [ ] "Do you have code for this?" highlights the GitHub link but does not open it unless the user says open.
- [ ] Ambiguous "open it" after a focused project opens the most recently focused project link only if prior context is clear.

### Experience Commands

- [ ] "Tell me about INDMoney" focuses INDMoney.
- [ ] "Walk me through the INDMoney journey" retrieves INDMoney experience and outcomes.
- [ ] "What did he do at ET Money?" focuses ET Money.
- [ ] "Tell me about support automation" highlights ET Money support automation.
- [ ] "What happened with Loan Against Mutual Funds?" highlights the LAMF outcome.
- [ ] "Tell me about LearnApp" focuses LearnApp.
- [ ] "What failed at INDMoney?" retrieves the Goals feature failure if available.

### Music Commands

- [ ] "Play music" starts playback.
- [ ] "Pause music" pauses playback.
- [ ] "Next song" skips to next song.
- [ ] "Previous song" skips to previous song.
- [ ] "Play Open It Up" plays `open-it-up`.
- [ ] "Play What Good Looks Like" plays `what-good-looks-like`.
- [ ] "Play Closer to the Choice" plays `closer-to-the-choice`.
- [ ] "Play Make it to the End" plays `make-it-to-the-end`.
- [ ] "Play the project song" plays `open-it-up`.
- [ ] "Play the ET Money song" plays `what-good-looks-like`.
- [ ] "Play the INDMoney song" plays `closer-to-the-choice`.
- [ ] "Play the LearnApp song" plays `make-it-to-the-end`.
- [ ] After focusing ET Money, "play something from this phase" plays `what-good-looks-like`.
- [ ] After focusing INDMoney, "play something from this phase" plays `closer-to-the-choice`.
- [ ] After focusing LearnApp, "play something from this phase" plays `make-it-to-the-end`.
- [ ] After focusing projects, "play something for this" plays `open-it-up`.
- [ ] "Open the music player" opens the player.
- [ ] "Close the music player" closes the player.
- [ ] "Lower the music" reduces music volume.
- [ ] "Make the song louder" increases music volume.
- [ ] "Mute the music" sets music volume to 0 or pauses, based on chosen behavior.
- [ ] "Lower your voice" reduces JJ/audio output volume, not music.
- [ ] Ambiguous "lower the volume" asks a clarification or uses the currently active audio source.

### Retrieval Quality

- [ ] INDMoney query returns `experience:indmoney`.
- [ ] INDMoney financial planning query returns `outcome:indmoney-financial-planning`.
- [ ] INDMoney insurance query returns `outcome:indmoney-insurance-recommendations`.
- [ ] ET Money support query returns `outcome:etmoney-support-automation`.
- [ ] LAMF query returns `outcome:etmoney-lamf`.
- [ ] ET Money Earn query returns the correct ET Money Earn outcome.
- [ ] LearnApp query returns `experience:learnapp` and relevant course outcome.
- [ ] Agentic AI query returns relevant agent projects.
- [ ] Voice AI query returns US Stocks Analysis Agent and AI Evaluation Framework where relevant.
- [ ] Mutual fund semantic search query returns MF Semantic Search.
- [ ] Music query returns song chunks, not profile chunks.
- [ ] "Project song" retrieves `song:open-it-up`.
- [ ] "ET Money song" retrieves `song:what-good-looks-like`.
- [ ] "INDMoney song" retrieves `song:closer-to-the-choice`.
- [ ] "LearnApp song" retrieves `song:make-it-to-the-end`.
- [ ] "Boom bap track" retrieves `song:what-good-looks-like`.
- [ ] "Hard rock track" retrieves `song:closer-to-the-choice`.
- [ ] "Acoustic rock track" retrieves `song:make-it-to-the-end`.
- [ ] Navigation query returns navigation chunk or direct command, not profile evidence.
- [ ] Forbidden chunks are not selected for unrelated queries.
- [ ] Reranker rejects semantically close but wrong chunks.

### Answer Grounding

- [ ] JJ does not invent employers.
- [ ] JJ does not invent metrics.
- [ ] JJ does not attach tools to projects unless source evidence supports it.
- [ ] JJ says when evidence is missing.
- [ ] JJ prefers professional evidence over side projects when both apply.
- [ ] JJ does not produce match scores, ratings, percentages, or 0-10 fit numbers.
- [ ] JJ distinguishes direct shipped evidence from adjacent evidence.

### External Links and Safety

- [ ] External links do not open from vague mentions.
- [ ] External links open after explicit "open GitHub/demo" intent.
- [ ] If no link exists, JJ says it cannot find that link.
- [ ] Same-tab/new-tab behavior is consistent and documented.
- [ ] Browser popup blocking is handled gracefully.

### Mobile / Responsive Functional Checks

- [ ] JJ demo can start on mobile viewport.
- [ ] Page commands work on mobile.
- [ ] Music commands work on mobile.
- [ ] Mobile music sheet can open/close by voice.
- [ ] Nav hiding behavior does not break voice commands.

### Existing Chat Regression

- [ ] `/chat` still loads.
- [ ] Existing `/api/agent` route still streams valid SSE.
- [ ] Existing PDF parsing constraints remain intact.
- [ ] FitCard behavior remains unchanged until separately implemented.
- [ ] No changes introduce numeric fit scoring.

## Functional Demo Definition of Done

The first milestone is complete when:

1. `node node_modules/typescript/lib/tsc.js --noEmit` passes.
2. `npm run lint` passes.
3. JJ can start a realtime voice session in the browser.
4. JJ can speak a response.
5. JJ can run a page navigation command by voice.
6. JJ can focus or highlight at least one project by voice.
7. JJ can focus or highlight at least one experience/outcome by voice.
8. JJ can play, pause, and play a specific music track by voice.
9. JJ retrieves relevant chunks from the static RAG index.
10. Retrieval evals run and print useful metrics.
11. Existing chat and music player still work.

## Notes and Open Decisions

- [ ] Decide exact OpenAI realtime model name at implementation time from current official docs.
- [ ] Decide whether final JJ voice uses OpenAI native voice or Sarvam TTS after functional demo.
- [ ] Decide whether "mute music" should pause or set music volume to zero.
- [ ] Decide whether external links open in a new tab or same tab.
- [ ] Decide where the temporary functional demo control appears before final UI polish.
- [ ] Decide whether retrieval index generation is manual-only or part of a guarded CI script.
