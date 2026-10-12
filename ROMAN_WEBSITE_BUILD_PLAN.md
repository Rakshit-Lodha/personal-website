# Roman website: frontend, backend and asset build plan

Date: 12 October 2026  
Status: Implementation proposal grounded in the current repository. No deployment or service provisioning has been performed.  
First milestone: loader → arrival → work journey, working on desktop and mobile at `/roman`.

Asset progress, 12 October 2026: nine text-free architectural/texture masters and 34 optimized AVIF/WebP variants have now been created. See [asset library](design/roman/README.md), [manifest](design/roman/asset-manifest.json) and [gallery](design/roman/gallery.html). Mobile loader, fonts, real product captures and optional independent depth layers remain outstanding. The website implementation itself is not yet complete.

## 1. Product decisions and scope

### Approved direction

- A visually rich personal website, with Roman architecture, carved reliefs, travertine, ivory, Pompeian red and restrained bronze details.
- Preserve the approved Augustus / Festina Lente loader. Continue its material world into the arrival.
- Fine Roman inscription-style display lettering; clean, readable utility and body typography. Avoid the heavy editorial serif that reappeared in some generated images.
- Mobile is a separately composed experience, with ordinary vertical scrolling and usable touch controls.
- WHOOP appears near the end as plain labelled readings. No strings, sculptures, health-driven atmosphere, connecting lines or fitness dashboard metaphors.
- Work journey precedes selected projects.
- Daily Muse editions and Rakshit's authored writing are separate content types.
- Preserve JJ and finish with contact links and a Roman quote.

### Not approved or intentionally excluded

- Neon, plants, Mediterranean home decor, giant interactive name lettering, previous `/curious` and `/wavelength` themes.
- Whole-page raster images used as the actual interface.
- Forced cinematic scrolling, mandatory multi-second waits, automatically enabled microphone or sound.
- WHOOP Age, health rankings or invented health interpretations.
- A final closing quote: Seneca's sharing quote is the preview choice, not a final user selection.

### Content accuracy

Generated screenshots, career copy, health numbers and article titles are placeholders. Do not publish them as facts. In particular, `src/lib/profile/projects.ts` describes Krux.news as an **AI news product**, not the markets product shown in generated screens. Use existing profile evidence, verify current links and capture real interfaces. Do not assume the number of career chapters or their dates from image mockups.

## 2. Existing system: reuse before replacing

Inspected on the date above:

| Existing resource | Implementation consequence |
| --- | --- |
| Next.js 16.2.6, React 19.2.4, TypeScript, Tailwind 4 | Keep App Router and the current build stack |
| Framer Motion already installed | Use it plus CSS for transitions; do not add GSAP by default |
| Three.js / React Three Fiber / Drei already installed | Available, but not required for the Roman opening; keep out of initial bundle |
| `src/app/layout.tsx` | Already wraps routes in music and site-action providers; avoid duplicate providers |
| `src/components/music/` and `src/lib/musicData.ts` | Reuse music state and existing licensed/owned audio |
| `src/components/jj/` | Reuse JJ session/controller and restyle the presentation |
| `src/lib/jj/surfaces/types.ts` and `SiteActionProvider` | Register Roman section/project/career navigation through the surface adapter |
| `/api/jj/session`, `/api/jj/retrieve` | Keep existing voice authentication and retrieval path |
| `/api/agent`, `/api/parse-jd`, `/api/transcribe`, `/api/speak` | Preserve existing chat and speech services |
| `src/lib/profile/experience.ts`, `projects.ts`, `chapters.ts`, `identity.ts` | Source material for validated website copy |
| `public/landing/`, `public/music/` | Audit reusable logos, project art and music before commissioning replacements |
| `/city`, `/curious`, `/wavelength` | Existing experiments; do not overwrite or remove them |

The working tree has substantial pre-existing changes. Preserve them. Start implementation on a `codex/` branch when appropriate, without resetting or mass-staging unrelated files. No database integration was identified in the inspected app; confirm deployment infrastructure before selecting paid services.

## 3. Page architecture and frontend behaviour

| Section / stable anchor | Content | Desktop | Mobile |
| --- | --- | --- | --- |
| Loader | Augustus, Festina Lente, translation, attribution | Existing short video, then reveal arrival | Dedicated portrait composition and static fallback |
| 01 `arrival` | Name, accurate short introduction, Explore my work, Talk to JJ | Roman arch and relief framing real HTML | Cropped arch, readable introduction, both actions accessible |
| 02 `journey` | Employer, role, dates, focus, outcomes, lessons | Chapter navigation with one expanded chapter | Vertical accessible accordions; chronological sequence, no required carousel |
| 03 `projects` | Real screenshots, problem, contribution, decisions, outcomes, demo/case study | Featured project and selectable project list | Full-width project preview and stacked actions |
| 04 `reading` | Latest Muse one-pager, audio, source links, archive | Editorial edition preview | Read/listen controls and persistent mini-player |
| 05 `writing` | Authored essays, notes, work in progress | Quiet article list with date and reading time | Single-column list and comfortable article measure |
| 06 `playground` | Experiments and music, followed by WHOOP | Compact experiences, then plain metrics | Stacked experiences, then two-column metrics and comparison action |
| 07 `jj` | AI voice guide, suggested questions, text alternative | Dusk architectural scene, clear voice controls | Thumb-sized microphone control; explicit permission request on tap |
| 08 `contact` | Email, LinkedIn, X, résumé/Index, closing quote | Restrained contact row followed by inscription-like closing | Vertical contact links, then quote and attribution with breathing room |

Keep navigation understandable without exploring the art. Native links and headings must remain functional if motion fails. All content pages get a route back to the homepage section.

### Proposed routes

| Route | Purpose |
| --- | --- |
| `/roman` | Isolated preview; `noindex` until launch |
| `/` | Approved Roman homepage after cutover |
| `/projects/[slug]` | Individual case studies, direct demo links |
| `/reading` | Searchable/paginated edition archive |
| `/reading/[date]` | Edition permalink, one edition per Asia/Kolkata date |
| `/writing` and `/writing/[slug]` | Authored writing index and article |
| `/compare` | Private WHOOP connection/comparison flow; noindex |
| `/index` | Straightforward résumé/career facts, optionally downloadable résumé |
| `/chat` | Existing text/hiring chat remains available |

### Proposed code organisation

```text
src/app/roman/page.tsx
src/components/roman/
  RomanExperience.tsx         # composition; isolate client islands
  Loader.tsx
  ArchitectureScene.tsx      # responsive image layers, not a page screenshot
  Arrival.tsx
  WorkJourney.tsx
  SelectedProjects.tsx
  DailyReading.tsx
  WritingList.tsx
  Playground.tsx
  WhoopSnapshot.tsx
  JJSection.tsx
  Closing.tsx
  roman.module.css
src/lib/roman/
  content.ts                 # adapters over existing profile data
  surface.ts                 # existing JJ SurfaceAdapter implementation
  theme.ts
src/lib/reading/              # schemas, publication, queries
src/lib/whoop/                # OAuth, API client, normalization, comparison
src/lib/server/               # database, auth, storage; server-only imports
content/writing/*.md          # trusted authored Markdown + validated frontmatter
content/projects/*.md         # case studies, linked to canonical project IDs
public/roman/                 # optimized production assets only
design/roman/                 # source art, manifest, reference boards, licences
```

Server-render content and metadata. Hydrate only accordions, navigation adapters, players, loader and lightweight motion. WHOOP errors must not prevent the homepage from rendering. Reuse existing profile/project IDs so JJ can focus the correct items.

### Typography and motion

- Test a properly licensed Roman-capital face at real mobile sizes; choose after comparing it with the approved arrival. Do not assume the existing Instrument Serif is the approved display face.
- Retain Inter or Figtree for body and controls if it fits; scope Roman fonts to the preview to avoid changing production.
- Start body at 16–18px, comfortable line height, 44px minimum touch targets, visible focus, contrast checked over solid reading surfaces.
- Native vertical scroll; minimal image-layer parallax on capable desktop devices. No scroll hijack.
- Loader: once per session; muted, inline, skip available, hard failure timeout. Render content underneath immediately. If video fails or reduced motion/data saving applies, use a brief static transition. Do not hold visitors on a final frame waiting for WHOOP or audio.
- Video duration is 1.5 seconds in the inspected source. Treat this as an upper aesthetic target, not an artificial minimum delay.
- Deep links and returning content-page visits should bypass the intro.
- Shared audio coordinator: music, digest and JJ cannot speak over one another. On JJ start pause other audio; do not restart it unexpectedly. Digest playback persists across in-app navigation and supports native media controls.
- Portrait layouts use dedicated assets/crops. Essential interactions must never depend on hover or tilt.

## 4. Backend architecture

Use Next.js Route Handlers and server-side services. No separate application server is needed initially. Proposed persistence: managed PostgreSQL plus S3-compatible object storage for daily audio and edition images. Provider remains to be chosen after checking the existing hosting account; do not provision or purchase as part of this plan.

Static career/project data and authored Markdown remain in Git. Dynamic daily editions, publication revisions, WHOOP credentials and refresh jobs need durable persistence. Do not write publication data to a serverless filesystem.

### Data models

| Model | Essential fields and constraints |
| --- | --- |
| `reading_editions` | UUID, unique edition date, unique slug, title, summary, published revision ID, status, created/published/updated times |
| `reading_revisions` | edition ID, revision number, schema version, sanitized Markdown, source list, audio asset ID, transcript, payload hash; unique edition/revision |
| `media_assets` | object key, owner/publisher ID, MIME, bytes, SHA-256, duration, validation status; no arbitrary public upload |
| `publication_requests` | publisher ID, idempotency key, body hash, response, timestamps; unique publisher/key |
| `whoop_connections` | owner or visitor type, account ID, encrypted credentials, expiry, granted scopes, refresh version, revoke state; server-only |
| `whoop_owner_snapshots` | public allowlisted metric values, source measurement times, sync time, score state; never token/profile payloads |
| `comparison_sessions` | hashed opaque session ID, connection reference, consent time/version, expiry, restricted aggregate payload |
| `jobs` | type, dedupe key, attempts, next run, status, safe error code; supports retry and cleanup |

Migration scripts go in Git. Use transactions for publishing and token rotation. Public database access must not expose private tables; use server credentials and least-privilege roles. Configure backups and test restoring a published revision before launch.

### Muse publication contract

Muse already creates the digest. The website receives it; it does not need to collect X bookmarks or run another summarizer.

Proposed sequence:

1. Muse obtains a short-lived upload URL from `POST /api/publisher/media` using a scoped service credential.
2. Upload audio to the controlled bucket, then finalise/validate it. Verify type, actual file signature, size, checksum and duration.
3. `PUT /api/publisher/editions/[date]` submits a complete edition, media ID and idempotency key.
4. Validate with Zod; store an immutable revision and atomically update the published pointer. No partial edition becomes visible.
5. Return the canonical URL and revision. Invalidate only affected latest/archive/detail caches; enqueue JJ index update.
6. Return identical results on retry of the same key/body. Reject the same key with changed payload (`409`). Corrections use a new key and expected revision to avoid lost updates.

```json
{
  "schemaVersion": 1,
  "date": "2026-10-12",
  "timezone": "Asia/Kolkata",
  "title": "Example edition title",
  "summary": "A short editorial summary.",
  "bodyMarkdown": "## An idea\nAn original summary with source references.",
  "sources": [{ "url": "https://x.com/example/status/example", "label": "Original post", "author": "Example" }],
  "audioAssetId": "validated-media-uuid",
  "audioTranscript": "Transcript of the narrated edition.",
  "status": "published",
  "expectedRevision": 0
}
```

The example URL/content above is a fixture, not publishable production content. Start with a 1 MB JSON cap and 50 MB audio cap; adjust from a real Muse sample. Publishing should require a validated audio asset for the intended read-and-listen edition; support an explicit text-only status if generation fails, never a broken play button.

Use Markdown with raw HTML disabled and safe HTTP(S) links. Never execute remote MDX. Source material is untrusted content, including when JJ retrieves it. Do not fetch arbitrary submitted URLs on the server. Use owned uploads instead of accepting arbitrary audio-fetch URLs. Rotate publisher credentials, rate-limit publication, redact secrets and retain an audit trail. A draft mode can support initial end-to-end tests; routine automated publishing is the user's intended workflow.

Endpoints additionally needed: published list/detail queries, revision rollback/unpublish through authenticated publisher actions, and an authenticated job route for retries. Public list/detail can be server queries rather than redundant HTTP calls inside React Server Components. Show the latest available date if a daily publication is missed; never label an old edition as today.

### Authored writing

- Git-backed Markdown with frontmatter: slug, title, summary, date, updated date, kind (`essay | note | work-in-progress`), tags, draft, optional cover.
- Validate dates and unique slugs at build time. Drafts are excluded from public pages, sitemap and JJ retrieval.
- Authored articles have independent provenance; Muse does not overwrite them.
- Add a browser editor only if the Git workflow becomes a real obstacle; it is not required for initial launch.

### WHOOP owner feed

- Register a WHOOP app and configured callback URLs. Confirm development-user limits and public app approval requirements before enabling arbitrary visitors.
- Start with `read:recovery`, `read:sleep`, `read:cycles`; owner connection also needs offline access for refresh. Do not request profile, body measurement or workout access until a feature uses it.
- Owner onboarding must require administrator authentication and explicit owner binding. A visitor callback must never replace the public owner's account.
- OAuth authorization-code flow on the server, one-use state bound to a secure session, strict return-path allowlist and callback validation. Use a maintained OAuth implementation compatible with WHOOP.
- Encrypt credentials at rest with a separately managed key. Never put them in client bundles, localStorage or logs.
- Refresh under a per-account lock and atomically replace rotated tokens. On revoked access stop jobs and mark disconnected.
- Scheduled owner sync initially every 30 minutes, with bounded retries/backoff on 429/5xx. Cache public readings so page visits do not trigger WHOOP API calls. Later add verified webhooks if needed; do not assume webhook authentication behaviour before checking its documentation.
- Public endpoint `GET /api/whoop/public` returns only selected metrics, measurement timestamps and stale/unavailable state.
- Display recovery %, sleep **performance** %, strain, HRV in ms and resting heart rate in bpm. Sleep performance is not hours slept. Preserve source semantics and scored/calibrating status.
- Show separate measurement time and last-sync time where they differ. Strain can be today's partial cycle while sleep/recovery belong to the last scored sleep; do not imply they were all measured simultaneously.
- Missing/unscored values show an em dash or explanation, never zero. On failure retain last good data with a stale label. No sample values on production.

### Visitor comparison

| Endpoint | Behaviour |
| --- | --- |
| `POST /api/whoop/connect` | Start consent flow for visitor or authenticated owner; CSRF protection |
| `GET /api/whoop/callback` | Verify state; exchange code; bind account to the correct secure session |
| `GET /api/whoop/comparison?days=30` | Return only the current visitor's comparison; private/no-store |
| `POST /api/whoop/disconnect` | Revoke connection and delete visitor data; CSRF protection |
| `POST /api/jobs/whoop-sync` | Authenticated owner-sync job |
| `POST /api/jobs/cleanup` | Expire comparisons and process revocation/deletion retries |

Default to a temporary visitor session with a proposed maximum one-hour lifetime. Do not request visitor offline access for a one-off comparison. Use an opaque Secure/HttpOnly/SameSite cookie; keep all raw data server-side. After successful aggregation revoke upstream access as soon as it is no longer needed; expire and delete remaining aggregates automatically. Revocation failures get a bounded retry job while local access is disabled. State the actual retention policy in the connection UI.

Compare the previous 30 **completed** local calendar days, excluding today's partial strain. Document timezone mapping; show range, scored-day counts and coverage for each person. Use averages of scored readings and report units; never treat missing days as zero, add daily strain scores together or declare a health winner. If sample coverage differs materially, show the counts and avoid a misleading difference summary. Future workout comparison needs a separately justified scope.

Visitor comparison output must never enter a shared CDN cache, public index, analytics payload or JJ knowledge base. Public owner data uses a separate allowlisted query. Support denial, cancellation, expired token, insufficient history, rate limits and revoked authorization with a usable return to the site.

### JJ and audio integration

- Keep `/api/jj/session` and `/api/jj/retrieve`; existing `OPENAI_REALTIME_MODEL` / voice environment overrides stay in place.
- Register a Roman `SurfaceAdapter` to scroll to anchors, expand career entries and focus projects. Update shared command unions/schemas only when required.
- Add commands for opening an edition/article and playing/pausing its audio. Validate IDs against published content and require explicit intent for external navigation.
- Extend retrieval to published editions and authored writing with URLs, dates and provenance. Existing generated portfolio chunks alone cannot stay current with daily publishing; use a separately updated dynamic content index or filtered database search.
- Publishing/unpublishing updates that dynamic index idempotently; retry failures and expose index lag. Never include drafts or visitor health data.
- Bound session creation by rate and duration to control abuse/cost. Handle microphone denial, unsupported browser and session failure; keep `/chat` available.
- Follow AGENTS.md: do not alter PDF parsing pins/config or SSE contracts. No numeric job-fit scores. The no-fit-score rule does not ban display of actual WHOOP measurements.

## 5. Asset plan

### Reference inventory

These are design references, not implementation-ready page images:

| Reference | Current local source |
| --- | --- |
| Loader video | `/Users/rakshitlodha/Desktop/Videos/festina/build/render_min.mp4` |
| Loader check image | `/Users/rakshitlodha/Desktop/Videos/festina/build/min_check.png` |
| Revised arrival desktop/mobile | `/Users/rakshitlodha/.codex/generated_images/01a123c5-1324-7e20-874f-11303c57709d/exec-764f2072-c541-429d-a165-e48b666c01ac.png` |
| Section storyboard | `/Users/rakshitlodha/.codex/generated_images/01a123c5-1324-7e20-874f-11303c57709d/exec-6f380534-ba59-4360-94ad-c92fce6c2811.png` |
| Mobile sections 1–4 | `/Users/rakshitlodha/.codex/generated_images/01a123c5-1324-7e20-874f-11303c57709d/exec-6f1a9748-29cc-4a3f-b3e5-e90a16eb9022.png` |
| Mobile sections 5–closing | `/Users/rakshitlodha/.codex/generated_images/01a123c5-1324-7e20-874f-11303c57709d/exec-4b36a27a-297b-4b70-9a0d-81c4dfc4af51.png` |

At implementation kickoff verify these files, copy reference boards into `design/roman/references/`, and record their provenance. Preserve originals. The supplied check image may be a contact sheet rather than a usable poster: inspect dimensions and extract a clean full video frame instead of using it blindly. Recheck attribution in the final loader export; the reviewed source omitted it.

### Deliverables

| ID | Asset | Variants / output | Priority |
| --- | --- | --- | --- |
| A01 | Augustus loader | Desktop 1920×1080 source; portrait 1080×1920; muted H.264 MP4, optional tested WebM; full-frame AVIF/WebP posters | P0 |
| A02 | Arrival architecture | Text-free desktop 2560×1600 and portrait 1200×1800 masters; optimized responsive derivatives | P0 |
| A03 | Arrival depth layers | Optional arch foreground with alpha, background colonnade, relief strip; consistent lighting/perspective and safe text area | P0 if motion needs them |
| A04 | Material textures | Small low-contrast plaster/travertine tile and red-plaster accent; no baked text, no distracting seams | P0 |
| A05 | Typeface files | Licensed display and body WOFF2, required weights only, licence retained | P0 |
| A06 | Career imagery/logos | Audit existing employer logos; relief transition crop; logos remain accurate and legible | P1 |
| A07 | Project screenshots | Real KRUX, MF Search and JJ screens at desktop/mobile sizes; product-specific alternate text; optional short silent demos | P1 |
| A08 | Reading artwork/audio | Optional per-edition cover, compressed audio and transcript supplied by Muse; controlled object storage | P1 |
| A09 | Writing artwork | Optional editorial covers; typography-led pages must work without them | P1 |
| A10 | Playground courtyard | Text-free desktop and mobile crops; existing music covers/audio audited | P2 |
| A11 | JJ dusk arcade | Desktop/portrait background and optional low-motion light layer; static fallback | P2 |
| A12 | Closing inscription area | Quiet wall/relief background with safe quote area; quote rendered as HTML, never baked in | P2 |
| A13 | Social/share art | 1200×630 site image plus project/article/edition templates; actual titles rendered deterministically | P2 |
| A14 | UI icons | Reuse Lucide/CSS for microphone, play, arrows, menu, external links; accessible labels | P0 |

Asset production order: A01/A02/A04/A05 → browser opening review → career/projects → reading/writing → playground/JJ/closing. Avoid commissioning every background before proving the opening.

Generate or commission **text-free architectural assets**, not screenshots of interfaces. Match camera height, stone warmth, relief detail and light direction across scenes. Keep foreground detail away from mobile text. Use imagegen for new raster art; preserve transparency on foreground layers. Use standard image tooling for encoding and size derivatives. Full 3D, paid video generation and sound design are optional follow-ups, not prerequisites. OpenRouter is not a runtime animation dependency.

Maintain `design/roman/asset-manifest.json` with ID, source/prompt, author/licence, intended section, dimensions, focal point, mobile crop, derivatives, bytes, alt/decorative status and approval state. Keep editable masters outside `public/`; only optimized production derivatives ship. Use versioned names rather than silently replacing approved art.

### Initial performance targets (budgets to measure, not promises)

- Desktop hero artwork ≤350 KB; mobile ≤220 KB; combined loader poster + initial hero request budget ≤500 KB on mobile.
- Optimize loader toward ≤700 KB desktop / ≤400 KB mobile if visual quality holds; otherwise prefer poster and immediate reveal on constrained connections.
- Optional video never blocks fetching the actual page's largest content image. Lazy-load below-fold art and voice code; audio uses metadata-only preload.
- Fonts ≤150 KB initially; load only Roman-route families/weights, not every existing family.
- Add ≤80 KB gzip of Roman-specific client JavaScript initially, excluding deferred voice/media; measure shared provider impact too.
- Target LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 under representative mobile conditions. Measure field data after release.
- Long pages must not load a full-resolution architectural image for every section simultaneously.

## 6. Services, secrets and operations

Existing: `OPENAI_API_KEY`, `OPENAI_REALTIME_MODEL`, `OPENAI_REALTIME_VOICE`, agent/context/websearch model overrides, optional analytics ID. Preserve existing configuration; never print secrets while auditing.

Proposed server-only configuration: database URL, object-storage credentials/bucket, publisher credential hash, WHOOP client ID/secret and redirect URI, encryption key/version, job authentication secret, administrator authentication configuration and owner-account binding. No secret gets a `NEXT_PUBLIC_` prefix. Separate preview and production stores, credentials and OAuth callbacks.

Select a scheduler supported by the actual host. Track last Muse publication, validation failures, audio availability, WHOOP sync age, token-refresh errors, cleanup lag and JJ session failures. Log IDs/status codes rather than credentials, transcripts or raw health payloads. Add a small documented runbook for missed edition, rejected audio, stale owner data, compromised publisher credential and rollback.

## 7. Build phases and acceptance criteria

### Phase 0 — Foundation and source audit

- [ ] Snapshot working-tree state; establish scoped implementation branch/preview route.
- [ ] Verify and copy approved reference assets; create manifest.
- [ ] Verify career dates/outcomes, real project links, intro copy and résumé URL.
- [ ] Pick licensed fonts in a real mobile type specimen; choose final quote later.
- [ ] Establish motion, colour and layout tokens scoped to Roman route.

Exit: accurate content inventory, identified asset gaps, preview scaffolding without production changes.

### Phase 1 — Complete opening

- [ ] Build responsive loader, safe skip/failure path and static alternative.
- [ ] Build arrival using A02 art plus semantic HTML.
- [ ] Implement journey accordion and stable JJ-compatible IDs.
- [ ] Test at 360, 390, 430, 768 and 1440px, plus a real iPhone and Android where available.
- [ ] Review video-to-page continuity, typography, focus order and load cost.

Exit: convincing mobile and desktop opening; no horizontal overflow, invisible controls or forced wait. This is the first visual checkpoint.

### Phase 2 — Content experience

- [ ] Build projects with real captures and case-study routes.
- [ ] Build writing index/details, draft handling, metadata and sitemap rules.
- [ ] Build reading latest/archive/detail with validated fixture editions.
- [ ] Integrate persistent digest playback with existing music state.
- [ ] Build playground, JJ visual surface, contact and configurable closing quote.

Exit: complete navigable frontend with fixtures visibly labelled where real data is absent; keyboard and touch paths work.

### Phase 3 — Muse publication backend

- [ ] Provision chosen persistence/storage only after account/provider decision.
- [ ] Add migrations, publisher authentication, signed upload and edition validation.
- [ ] Implement atomic revision publishing, retries, rollback, unpublish and cache invalidation.
- [ ] Have Muse publish one real test edition end to end, then correct it and retry the request.
- [ ] Confirm audio playback, sources, archive entry and JJ index update.

Exit: daily publication requires no manual repository edit or deploy. Failure leaves previous published edition usable.

### Phase 4 — WHOOP

- [ ] Confirm app registration/approval requirements and scopes; connect authenticated owner.
- [ ] Add normalized public snapshot, scheduled refresh, stale and disconnected states.
- [ ] Test refresh rotation under concurrency and source measurement timestamps.
- [ ] Add temporary visitor comparison, consent, matching periods, private caching policy and deletion/revocation.
- [ ] Test two visitor sessions to prove isolation.

Exit: real readings with no fabricated fallback; private comparisons cannot leak across users. Owner feed can ship ahead of visitor comparison if approval remains pending, with comparison clearly unavailable rather than a dead button.

### Phase 5 — JJ, validation and launch

- [ ] Register Roman navigation surface; extend published-content retrieval and audio commands.
- [ ] Test voice/music/digest arbitration and denied-microphone fallback.
- [ ] Run typecheck, lint, production build and JJ retrieval evaluations.
- [ ] Run accessibility, responsive and performance checks; assess animation on lower-powered mobile hardware.
- [ ] Verify publication and WHOOP monitoring, retention cleanup and restore/rollback.
- [ ] Promote approved `/roman` composition to `/`; preserve `/chat`, existing links and content permalinks.
- [ ] Keep previous production composition recoverable by release rollback; remove preview indexing and duplicate canonical issues.

## 8. Verification strategy

Use focused tests for durable behaviour, not snapshot tests that simply restate markup:

- Muse schema validation, malicious/raw HTML rejection, duplicate retries, conflicting revisions, invalid audio, rollback/unpublish and draft exclusion.
- WHOOP normalized units/states, missing days, different timezones, incomplete cycles, sample coverage, refresh races, callback replay, private session isolation and expiry cleanup.
- Browser integration: loader failure/skip, deep links, journey controls, article routing, media continuity, JJ navigation and no audio overlap.
- Accessibility: semantic headings, contrast, keyboard navigation, screen-reader labels, expanded states, focus restoration, reduced motion and 200% zoom.
- SEO: server-rendered content, canonical links, only published pages in sitemap; noindex preview/private routes.

Commands available now:

```sh
node node_modules/typescript/lib/tsc.js --noEmit
npm run lint
npm run build
npm run build:jj-chunks
npm run build:jj-index
npm run eval:jj-retrieval
```

AGENTS.md has additional chat requirements: successful PDF parsing and Ready chip, fit badge for JD input, no badge for general questions, valid SSE with configured key. It also explicitly says FitCard is not yet implemented. Establish the actual baseline before editing shared chat code; record any pre-existing gap and resolve it if a chat feature is changed. Never claim the badge checks pass solely because TypeScript passes. Preserve `pdf-parse@1.1.1`, CJS parsing import and external-package config.

No app tests are required for creating this plan file. Tests above apply when implementation begins.

## 9. Remaining decisions and inputs

These do not block building the opening:

- Final introduction and which projects lead the selection.
- Closing quote: recommended preview is Seneca, Letters 6.4; final user choice outstanding.
- Final display font and its web licence.
- Real project captures; approval of public career outcomes and correct current résumé.
- Muse sample payload/audio and its deployment environment for storing a publishing credential.
- Existing hosting provider, managed database/storage choice and budget.
- WHOOP developer app, owner connection and public visitor approval path.

Do not request secrets in chat. Set credentials directly in local/deployment secret management. Distinguish code readiness from external-account readiness in progress reports.

## 10. References and implementation research

- [WHOOP OAuth](https://developer.whoop.com/docs/developing/oauth/): per-user authorization and rotating refresh credentials; implement server-side flow and account-level refresh serialization.
- [WHOOP getting started](https://developer.whoop.com/docs/developing/getting-started/): app registration and credentials.
- [WHOOP API](https://developer.whoop.com/api/): verify v2 response fields/scopes during implementation.
- [WHOOP rate limits](https://developer.whoop.com/docs/developing/rate-limiting/): respect configured quotas, cache owner data and bound retry traffic.
- [WHOOP app approval](https://developer.whoop.com/docs/developing/app-approval/): verify actual public-launch requirements before visitor rollout.
- [Seneca, Letter 6](https://en.wikisource.org/wiki/Moral_letters_to_Lucilius/Letter_6): proposed closing quote, “No good thing is pleasant to possess, without friends to share it.”
- [Seneca, Letter 1](https://en.wikisource.org/wiki/Moral_letters_to_Lucilius/Letter_1): alternative, “While we are postponing, life speeds by.”
- [Virgil, Aeneid X, Dryden](https://en.wikisource.org/wiki/The_Works_of_Virgil_%28Dryden%29/Aeneid/Book_X): alternative, “Fortune befriends the bold.”

Before implementing provider-specific APIs, cache invalidation, font installation or deployment configuration, verify the relevant official documentation for the installed versions. This plan selects responsibilities and contracts; it does not imply those integrations already exist.
