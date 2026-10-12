# City Plan — `/city` as a full portfolio surface

The isometric city at `/city` grows from a landing page into a complete alternative
front door: every building is a place Rakshit actually worked or a thing he actually
built, with JJ and the music player working inside it.

`/` (the current scroll site) and `/city` stay as **two equal front doors**. Neither
replaces the other for now. Both read from the same content sources.

## Decisions

| Question | Decision |
|---|---|
| Relationship to `/` | Both stay live as equal front doors. `/city` is a separate path; no swap planned yet. |
| Interiors | **Club and Factory get bespoke interiors.** Every other place reuses one shared cutaway shell with different props, signage, and lighting. |
| Deep content | **DOM panel over the 3D scene.** The city is navigation; the panel is content. Text stays selectable and accessible. |
| Copy | **Import, never duplicate.** The atlas references existing data by ID. City-specific wording goes in a `cityCopy` override field. |

## Two ideas that make this affordable

**Cutaway interiors, not separate scenes.** Focusing a building fades out its
near-facing walls to reveal a furnished interior in the same island — dollhouse style.
No scene swap, no loading, the city stays visible around it. Interiors are only built
when a place is focused.

**One command adapter, and JJ works on both surfaces unchanged.** `MusicPlayerProvider`
and `SiteActionProvider` already wrap the whole app in `layout.tsx`, so `/city` is
already inside them. The only DOM-coupled piece is `src/lib/jj/commandHandlers.ts`,
which calls `window.scrollTo` / `document.querySelector`. Making command *execution*
pluggable means the same `SiteCommand` vocabulary drives either surface, with **no
changes to the agent, prompts, tool schemas, or the eval suite**.

## Content map

Everything below already exists in the codebase. The atlas adds only spatial data.

| Place | Source | Notes |
|---|---|---|
| **Career Avenue** — 4 buildings | `EXPERIENCE`, `CHAPTERS` (MyStory) | Sized by tenure and outcome count |
| ├ LearnApp (2018–2020) | `learnapp` | Core Team Member, 1 outcome |
| ├ INDMoney (2020–2022) | `indmoney` | APM, 2 outcomes + **1 failure** |
| ├ ET Money (2022–2026) | `etmoney` | PM, **7 outcomes → 7 lit floors**, the tower |
| └ Paytm Money (Jul 2026–) | `paytmmoney` | Sr PM, current, under construction |
| **INDMoney dark floor** | `experience.ts` `failures` | The Goals feature that never got PMF |
| **Projects township** | `PROJECTS` where status is Live/Beta | 3 Live = finished · 2 Beta = scaffolding |
| **The Factory** | `PROJECTS` where status is Prototype | Where experiments happen. Absorbs the old Skill Foundry |
| **The Club** | `MusicPlayerProvider`, `SONGS` | Audio-reactive; see below |
| **Signal Tower** | JJ, `/chat` | JJ orb becomes the beacon |
| **Academy Hill** | `EDUCATION` | Unchanged |
| **Central Plaza** | `IDENTITY.contact` | Unchanged |

### The Club is driven by real audio

`MusicPlayerProvider` owns the audio element. Tap it with a Web Audio `AnalyserNode`
and drive the crowd's bounce and the club lights from actual amplitude, with the
existing word-level `KaraokeView` overlaying. The dancing is genuinely in time with
the track — cheap to do, and the difference between charming and cheap-looking.

## Architecture

```
src/components/city/
  atlas.ts            spatial data only; imports EXPERIENCE / PROJECTS / SONGS by ID
  CityLanding.tsx     canvas + HUD + panel; registers the city command adapter
  CityScene.tsx       camera rig, lighting, day/dusk
  places/             one component per place kind (Company, ProjectHouse, Club, Factory)
  interiors/          shared cutaway shell + the two bespoke rooms
  panel/              DOM content panels, fed from the same sources as `/`

src/lib/jj/
  commandHandlers.ts  surface-independent (music, volume, links) + delegates navigation
  surfaces/dom.ts     current scroll-and-flash behaviour (default, unchanged)
  surfaces/city.ts    fly camera, focus building, open panel
```

Atlas entries are keyed by the **existing** entity IDs (`JJ_COMPANY_IDS`,
`JJ_PROJECT_IDS`, `JJ_SONG_IDS`, outcome IDs) so `focus_experience: "etmoney"` resolves
to a building with no extra mapping layer.

## Phases

- **P0 — Foundations. ✅ done.** Surface adapter (DOM behaviour preserved exactly);
  `atlas.ts`; JJ + music mounted on `/city`.
- **P1 — Career Avenue. ✅ done.** 4 company buildings sized by outcome count,
  verified copy from `chapters.ts`, ET Money's 7 outcome floors, INDMoney's dark
  failure floor, and the DOM place panel. v1's abstract districts are gone.
- **P2 — Projects township + Factory.** 7 projects placed by status.
- **P3 — The Club.** Cutaway interior, audio-reactive crowd, karaoke overlay.
- **P4 — JJ in the city.** Voice commands fly the camera; orb as the Signal Tower beacon.
- **P5 — Polish.** Mobile, perf budget, reduced-motion, no-WebGL fallback.

## Constraints

- `/` must keep working exactly as it does today. The adapter refactor defaults to
  current DOM behaviour; any change there is a regression.
- Never duplicate verified copy. Import it.
- Respect `prefers-reduced-motion` throughout (already done in the v1 scene).
- Keep the Three.js bundle on the `/city` route only.
