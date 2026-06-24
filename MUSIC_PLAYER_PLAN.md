# Music Player — Implementation Plan

End-to-end plan for moving the music player from HTML mockups into the live Next.js codebase.

---

> **Status (2026-06-24):** Desktop chip is shipped and looks right (chip is a true sibling of the nav — same `clamp()` padding, same border-radius, height tracked via `ResizeObserver`; karaoke centered with word-level fill; ESC + click-outside close).
>
> **Mobile is NOT done.** The mobile strip, the dock-to-nav merge, and the fullscreen sheet are wired up and functional in code, but have **not** been visually tuned, tested on a real device, or compared against the mockups. Known things still to work out on mobile:
> - Strip `top` (currently hardcoded to 80px floating / 68px docked) needs to be tuned to the real mobile nav height — likely should also use `ResizeObserver` on the nav rather than fixed pixels.
> - Dock merge: verify the strip's flat top and the nav's flat bottom actually butt up cleanly with zero gap at common phone widths (iPhone 13/14/15, Pixel, etc.).
> - Sheet open/close transition needs a real polish pass — the current `AnimatePresence` slide-up is functional but not matched to `music-mobile-b-scroll.html`.
> - iOS Safari has different scroll behavior than Chrome; nothing has been verified there.
> - Karaoke font size + line wrapping in the mobile sheet was not re-tuned after the desktop fixes.

---

## Agent protocol

**Read this before starting any work.** When you pick up a task in this plan:

1. Change its checkbox from `[ ]` to `[~]` (in progress) **before** writing code.
2. When the task is finished AND its acceptance criteria pass, change to `[x]` and add a one-line note under it: `→ done: <what you verified>`.
3. If you discover the task is wrong, blocked, or needs to be split, do NOT skip ahead — pause and write a `**Note:**` line under it describing the issue, then either fix this plan or ask the user.
4. Do **one task at a time**. Don't batch checkmarks. Each `[x]` should reflect verified, tested work.
5. After each task, re-read the Open Questions section to see if your work answers any of them; if so, fold the answer in and remove the question.

The plan is the source of truth. If reality diverges, update the plan first, then write code.

---

## References

### Design / spec
- `DESIGN.md` — product & visual spec (authoritative)
- `AGENTS.md` — engineering constraints, definition of done
- `CLAUDE.md` — coding rules (simplicity, surgical changes, etc.)

### Mockups (use these for exact dimensions / motion timing)
- `music-final.html` — final consolidated mockup (desktop variant 2 + mobile 3 states)
- `music-mobile-b-scroll.html` — mobile-only interaction spec (scroll-to-dock + sheet open)
- `music-full-variants.html` — desktop variant 2 isolated (chip grow-in-place)
- `music-nav-variants.html` — original 6 placements (only variant 2 is shipping)

### Existing codebase patterns
- `src/lib/resumeData.ts` — pattern for single-source-of-truth data files
- `src/lib/chatResponses.ts` — pattern for deterministic local data
- `src/components/Hero.tsx` — design tokens (gradient text, fonts, colors)
- `src/components/LandingNav.tsx` — nav pill geometry, shadow stack, scroll-aware bg
- `src/app/page.tsx` — page composition; client component owning shared open state
- `src/app/globals.css` — CSS variables (`--background`, `--primary`, etc.) and reduced-motion handling

### Generated assets (do not commit raw audio if files are large; decide in Step 1)
- `music/*.mp3` — original Suno-rendered audio (4 songs)
- `scripts/lyrics-align/output/*.json` — line-level + word-level timestamps for each song
- `scripts/lyrics-align/align.py` / `repair.py` / `lyrics/*.txt` — one-time tooling that produced the JSONs (no need to re-run unless lyrics change)

---

## Design tokens (carry over from mockups)

- Background: `#F5F3EF` (page) / `#FFFFFF` (sections like Projects)
- Primary accent: `#1B6AE7` (the only blue)
- Text: `#170f49` (navy heading), `#5a607a` (body)
- Chip surface (collapsed): white with multi-layer shadow `0 6px 13px rgba(23,15,73,.04), 0 23px 23px rgba(23,15,73,.03), 0 53px 32px rgba(23,15,73,.02), 0 94px 37px rgba(23,15,73,.01)`
- Sheet surface (mobile fullscreen): `#F5F3EF`
- Chip dimensions:
  - Desktop collapsed: 240×56, border-radius 28px, beside nav
  - Desktop open: 420×460, border-radius 24px, grown in place
- Mobile strip:
  - At hero: `top: 96px, left/right: 12px, height: 42px, border-radius: 12px`
  - Docked: `top: 92px, height: 36px, border-radius: 0 0 12px 12px` (nav simultaneously gets `border-radius: 12px 12px 0 0`)
  - Sheet open: `top: 0, fullscreen, border-radius: 0`; nav fades out (`opacity: 0; transform: translateY(-12px); pointer-events: none`)
- Motion: easing `cubic-bezier(.2,.8,.2,1)`, duration ~400ms for grow/dock, ~250ms for fades
- Scroll threshold for mobile dock: 200px past hero
- Karaoke timing source: `audio.currentTime` driven via `requestAnimationFrame`

---

## Data model

`src/lib/musicData.ts` exports:

```ts
export type Word = { word: string; start: number; end: number };
export type Line = { text: string; start: number; end: number; words: Word[] };
export type Song = {
  id: string;            // kebab slug, e.g. "open-it-up"
  title: string;
  audio: string;         // "/music/open-it-up.mp3"
  cover?: string;        // "/music/covers/open-it-up.jpg" (optional)
  duration: number;      // seconds
  lines: Line[];
};
export const SONGS: Song[] = [ /* 4 entries, built from output/*.json */ ];
```

---

## Implementation steps

### 1. Data layer

- [x] **1.1** Copy audio: `music/<Title>.mp3` → `public/music/<slug>.mp3` (kebab-case slugs: `closer-to-the-choice`, `make-it-to-the-end`, `open-it-up`, `what-good-looks-like`)
  → done: 4 MP3s copied into `public/music/`.
- [x] **1.2** Extract embedded cover art for each MP3 → `public/music/covers/<slug>.jpg`
  → done: 4 360×360 JPEGs extracted via `ffmpeg -an -c:v copy`.
- [x] **1.3** Write a one-off conversion script (e.g. `scripts/lyrics-align/emit-ts.py`) that reads `scripts/lyrics-align/output/*.json` and emits `src/lib/musicData.ts` with the 4-song `SONGS` array (matching the Data Model section above)
  → done: `emit-ts.py` written; `src/lib/musicData.ts` regenerated (4 songs, type-checks clean).

### 2. State / provider

- [x] **2.1** Create `src/components/music/MusicPlayerProvider.tsx`
  → done: provider owns `<audio>`, song index, play state, sheet/dock flags, volume; rAF loop maintains `currentLineIndex` / `currentWordIndex`; `onended` advances to next song and resumes play if `isPlaying`.
- [x] **2.2** Decide autoplay strategy: muted autoplay then unmute on first interaction, OR wait for first interaction
  → done: chose first-interaction. `pointerdown` listener (once) calls `audio.play()`.
- [x] **2.3** Mount provider at the top of `src/app/page.tsx`
  → done: `<MusicPlayerProvider>` wraps the whole page tree.

### 3. Desktop chip (variant 2)

- [x] **3.1** Create `src/components/music/MusicChipDesktop.tsx`
  → done: collapsed 240×56 chip with cover/title/eq/play; click anywhere expands.
- [x] **3.2** Open state: grows in place to 420×460 via Framer Motion layout animation
  → done: motion.div tweens width/height; AnimatePresence swaps collapsed/expanded; click-outside + ESC close.

### 4. Mobile strip + dock behavior

- [x] **4.1** Create `src/components/music/MusicStripMobile.tsx`
  → done: floating + docked variants share one element with transitions; tap opens sheet.
- [x] **4.2** Scroll listener: when `window.scrollY > 200`, add `.docked` class
  → done: scroll listener lives in the provider, exposes `isDocked`. Strip reacts; nav reacts.
- [x] **4.3** Update `LandingNav` to accept a `docked` prop (or read from provider) and adjust its bottom radius
  → done: `LandingNav` reads `isDocked` from `useMusic` and flattens bottom-left/right corners while docked.

### 5. Full sheet (karaoke view)

- [x] **5.1** Create `src/components/music/MusicSheet.tsx`
  → done: mobile-only fullscreen sheet via Framer Motion. Desktop variant is implemented inline inside the chip (see 3.2).
- [x] **5.2** Karaoke implementation:
  → done: `KaraokeView` renders a 5-line window centered on `currentLineIndex`; active line uses word-level gradient mask driven by `currentTime`; non-active lines fade.
- [x] **5.3** Controls: play/pause, prev, next, volume slider, close button
  → done: shared `PlayerControls` component; ESC closes via `MusicSheet` and `MusicChipDesktop`; mobile sheet has 36×36 close button.
- [x] **5.4** Mobile sheet hides nav: when sheet is open, apply `opacity: 0; transform: translateY(-12px); pointer-events: none` to `LandingNav`
  → done: `LandingNav` outer container reads `isSheetOpen` and applies the fade/translate.

### 6. Wiring it together

- [x] **6.1** Update `src/app/page.tsx` to render `<MusicPlayerProvider>` wrapping everything
  → done.
- [x] **6.2** Mount `<MusicChipDesktop />` adjacent to `<LandingNav />` (or inside its container, depending on layout choice in mockup)
  → done: chip lives inside `LandingNav` outer flex row, hidden below `lg:`.
- [x] **6.3** Mount `<MusicStripMobile />` at root; CSS hides it on `lg:` and up
  → done: rendered inside a `lg:hidden` wrapper at the bottom of `page.tsx`.
- [x] **6.4** Mount `<MusicSheet />` at root, conditionally rendered when `isSheetOpen`
  → done: same `lg:hidden` wrapper; AnimatePresence inside `MusicSheet` handles the conditional render.

### 7. Polish & QA

- [x] **7.1** Respect `prefers-reduced-motion`: skip grow/dock animations, snap states instantly
  → done: Framer Motion `useReducedMotion()` zeros out the chip grow transition; global CSS rule in `globals.css` already zeros all CSS transitions (mobile strip dock + nav radius) under `prefers-reduced-motion: reduce`.
- [x] **7.2** Audio preloading: `preload="metadata"` not `"auto"` (avoid blocking page load)
  → done: `<audio preload="metadata">`.
- [x] **7.3** No layout shift when chip renders (reserve space in nav row)
  → done: chip lives in a flex sibling at fixed 240×56 from SSR; nav uses `flex-1` next to it. Container is `pointer-events: none`, so the chip renders synchronously with the nav.
- [ ] **7.4** Visual polish pass against `music-final.html` side-by-side
  **Note:** requires manual browser comparison; not done in this pass.
- [ ] **7.5** Run on real iOS Safari (different scroll behavior than Chrome)
  **Note:** requires a real device; not done in this pass.

---

## Test cases

Each test should be manually verifiable in `npm run dev`. Mark with notes.

### Playback
- [ ] **T1** Audio does NOT autoplay on page load (Chrome + Safari) — manual
- [ ] **T2** First click anywhere on page starts the audio — manual
- [ ] **T3** Clicking play/pause on the chip toggles playback — manual
- [ ] **T4** Audio survives across the chip → sheet transition (no restart) — manual (note: provider owns one persistent `<audio>`, so should hold)

### Karaoke sync
- [ ] **T5** Active line is highlighted within 100ms of the lyric being sung — manual
- [ ] **T6** Word-level fill within the active line tracks `audio.currentTime` — manual
- [ ] **T7** Pausing audio freezes karaoke at the current word; resuming continues — manual
- [ ] **T8** Seeking via volume / next-prev does NOT desync the karaoke — manual

### Desktop chip
- [ ] **T9** Collapsed chip fits beside `LandingNav` without overlap — manual
- [ ] **T10** Click chip → grows in place to 420×460 with smooth animation — manual
- [ ] **T11** Click outside or X collapses the chip — manual
- [ ] **T12** ESC closes the open chip — manual

### Mobile strip + dock
- [ ] **T13** At top of page: strip sits 96px from top, 12px gutters, 42px tall — manual
- [ ] **T14** Scrolling past 200px: strip docks and nav's bottom corners flatten — manual
- [ ] **T15** Scrolling back up: strip un-docks with same easing — manual
- [ ] **T16** Tapping strip in either state opens fullscreen sheet — manual
- [ ] **T17** Sheet open on mobile: nav is hidden — manual
- [ ] **T18** Cross button on sheet dismisses; nav re-appears — manual

### Cross-cutting
- [ ] **T19** Play state is consistent across chip, strip, and sheet — manual (shared provider, should hold)
- [ ] **T20** `prefers-reduced-motion: reduce` skips grow/dock animations — manual
- [ ] **T21** No console errors, no React key warnings — manual
- [ ] **T22** Chip / strip is visible on every section of the page — manual (strip uses `position: fixed`, chip uses fixed-positioned nav container)
- [ ] **T23** When a song ends, the next song in `SONGS` order auto-starts; last song wraps to first — manual (covered by `onAudioEnded`)
- [ ] **T24** Skip controls (next / prev) work in both chip and sheet — manual
- [ ] **T25** Cover art (extracted from MP3) appears in chip, strip, and sheet for each song — manual (cover URLs confirmed via curl 200)
- [x] **T26** `npm run build` succeeds
  → done: clean build, all routes prerender.
- [x] **T27** `npm run lint` clean (for files we own)
  → done: `npx eslint src/components/music/ src/lib/musicData.ts src/app/page.tsx src/components/LandingNav.tsx` is silent. Pre-existing warnings in `scripts/lyrics-align/venv/*` are unrelated (Python virtualenv).
- [x] **T28** `node node_modules/typescript/lib/tsc.js --noEmit` clean
  → done.

---

## Resolved decisions

1. **Song selection** — ship **all 4 songs** with skip controls (prev/next cycles the playlist)
2. **Cover art** — each MP3 has a 360×360 JPEG embedded (verified via `ffprobe`). Extract at build time into `public/music/covers/<slug>.jpg` (see step 1.5 below)
3. **Audio format** — keep MP3 as-is (no transcoding)
4. **Player visibility** — chip / strip stays visible across the **entire page**, not just the landing section
5. **Auto-advance** — when a song ends, automatically queue the next one in `SONGS` order (wraps around back to the first)
