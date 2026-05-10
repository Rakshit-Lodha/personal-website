# CLAUDE.md

# General Rules
1. Think Before Coding
Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

State your assumptions explicitly. If uncertain, ask.
If multiple interpretations exist, present them - don't pick silently.
If a simpler approach exists, say so. Push back when warranted.
If something is unclear, stop. Name what's confusing. Ask.
2. Simplicity First
Minimum code that solves the problem. Nothing speculative.

No features beyond what was asked.
No abstractions for single-use code.
No "flexibility" or "configurability" that wasn't requested.
No error handling for impossible scenarios.
If you write 200 lines and it could be 50, rewrite it.
Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

3. Surgical Changes
Touch only what you must. Clean up only your own mess.

When editing existing code:

Don't "improve" adjacent code, comments, or formatting.
Don't refactor things that aren't broken.
Match existing style, even if you'd do it differently.
If you notice unrelated dead code, mention it - don't delete it.
When your changes create orphans:

Remove imports/variables/functions that YOUR changes made unused.
Don't remove pre-existing dead code unless asked.
The test: Every changed line should trace directly to the user's request.

4. Goal-Driven Execution
Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

"Add validation" → "Write tests for invalid inputs, then make them pass"
"Fix the bug" → "Write a test that reproduces it, then make it pass"
"Refactor X" → "Ensure tests pass before and after"
For multi-step tasks, state a brief plan:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
node node_modules/typescript/lib/tsc.js --noEmit  # type check (npx tsc is broken due to a stray lockfile at ~/package-lock.json)
```

There are no tests yet.

## Architecture

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Framer Motion.

### Content data flow

All site content lives in two files that act as a single source of truth:

- `src/lib/resumeData.ts` — exports `CHAPTERS` (career story), `PROJECTS`, `EDUCATION`, and `CHAT_PROMPTS`. Every section component reads from here; update this file to change what appears on the page.
- `src/lib/chatResponses.ts` — local deterministic chat responses keyed by prompt string. When a real AI backend is wired in, this file is the only thing that needs to change in the chat flow.

### Page composition

`src/app/page.tsx` is a client component that owns the single piece of shared state: `chatOpen` (boolean). It renders five section components in order and passes `onChatOpen` callbacks to `Hero` and `CtaSection` so they can open the mobile chat drawer. The desktop chat panel is embedded directly inside `Projects`.

```
page.tsx
├── Nav              — fixed top bar, scroll-aware background
├── Hero             — full-viewport landing, triggers chat drawer on mobile
├── MyStory          — interactive chapter tabs; all state is local to this component
├── Projects         — 2×2 project grid + education row + ChatPanel (desktop sidebar)
├── CtaSection       — "Want to know more?" with chat + calendar links
└── ChatDrawer       — mobile-only slide-up sheet; rendered at root level to avoid z-index issues
```

### Chat panel / drawer split

`ChatPanel` is a pure UI component rendered in two contexts: as a sidebar inside `Projects` (desktop, `variant="sidebar"`) and inside `ChatDrawer` (mobile, `variant="drawer"`). The drawer is conditionally rendered at the root of `page.tsx` and slides up from the bottom on mobile; it is hidden on `lg:` breakpoints via Tailwind.

### Styling conventions

- Background is warm off-white (`#F5F3EF`), not white. Section alternation: `bg-background` (Hero, MyStory, CtaSection) vs `bg-white` (Projects).
- Electric blue `#1B6AE7` is the only primary accent. Green, amber, and purple are used exclusively for metric cards in MyStory.
- All CSS custom properties are defined in `src/app/globals.css` under `:root`. Tailwind v4 maps them via `@theme inline`.
- `font-serif` utility class applies Instrument Serif; use it only for the hero second line (`and I love building`). Everything else uses Inter.

### Framer Motion rules

- Use named easing strings (`"easeOut"`, `"easeInOut"`) — not raw cubic-bezier arrays. TypeScript rejects `number[]` as an `Easing` type in this version.
- Never put multiple `motion.*` siblings inside a single `<AnimatePresence>` using a fragment; split into separate `<AnimatePresence>` wrappers instead.
- All animations should respect `prefers-reduced-motion` (handled globally in `globals.css`).

### Adding a new shadcn component

```bash
npx shadcn@latest add <component-name>
```

Components land in `src/components/ui/`.

## Design source

`DESIGN.md` is the product and visual specification. `AGENTS.md` extends it with engineering constraints and the definition of done. Both files are authoritative — treat them as the design brief for any new features.
