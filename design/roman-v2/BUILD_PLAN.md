# Roman v2 — Contemporary Roman build plan

Date: 17 October 2026  
Status: Planning and concept references complete; implementation not started  
Preview route: `/roman-v2`  
Cutover target: `/roman` after review and QA

## 1. Objective

Rebuild the Roman portfolio as a responsive, production-grade site using the approved **Contemporary Roman** direction: editorial typography, warm stone surfaces, oxblood accents, Roman sculptural artwork, restrained halftone transitions, and real product interfaces.

The website must be implemented as accessible HTML, CSS and React—not as a stack of generated screenshots. Generated imagery is used only for artwork and texture layers. All text, controls, links, metrics and interactive states remain native UI.

## 2. Approved page structure

1. Floating navigation
2. Hero — “Product judgment.”
3. Work, over time
4. Selected products
5. Beyond work
6. Talk to JJ — “The portfolio can answer back.”
7. Final invitation and footer

The earlier “What I work on” chapter is removed. It duplicated information that is better demonstrated through career evidence and shipped products.

## 3. Content availability rule

All approved sections must be built in their **final populated layout**, even when real content or a destination URL is temporarily unavailable.

During development:

- Use typed, preview-only fixtures to show the intended composition.
- Do not collapse, remove or redesign a section as an empty state.
- Do not show “Coming soon” messaging merely because content will arrive shortly.
- Do not present fixture content as real production data.
- Keep unavailable actions visually present but non-clickable.
- Do not attach placeholder URLs such as `#`, empty strings or invented destinations.
- Do not invent health readings, publication dates, article titles or performance claims.
- When real content arrives, activate the existing component without changing its layout.

Availability is determined from the content contract, not from visual state:

| State | Presentation | Behaviour |
| --- | --- | --- |
| Preview fixture | Final designed layout | Action is inert and clearly non-interactive |
| Real content without URL | Real text/data | Action is inert |
| Real content with URL/action | Final designed layout | Native link or button is enabled |
| Missing numeric reading | Label remains visible; value is an em dash | No interpretation or invented zero |

Disabled actions should render as a `button` with `disabled`, or a non-interactive element with `aria-disabled="true"` where a button is not semantically appropriate. They must not receive misleading hover animation, pointer cursor or keyboard focus.

## 4. Route and cutover strategy

- Build the new experience at `/roman-v2` with `noindex` metadata.
- Keep the existing `/roman` implementation intact during development.
- Reuse existing server-side content adapters and providers.
- After visual approval and QA, switch `/roman` to the new composition.
- Retain the old implementation until the cutover is verified; do not delete it during the initial build.

## 5. Proposed code organisation

```text
src/app/roman-v2/
  page.tsx
  layout.tsx

src/components/roman-v2/
  ContemporaryRomanSite.tsx
  FloatingNav.tsx
  Hero.tsx
  CareerJourney.tsx
  SelectedProducts.tsx
  BeyondWork.tsx
  JJCallout.tsx
  ClosingFooter.tsx
  Reveal.tsx
  AvailabilityAction.tsx
  contemporary-roman.module.css

src/lib/roman-v2/
  content.ts
  fixtures.ts
  types.ts

public/roman-v2/
  hero/
  career/
  projects/
  beyond/
  jj/
  footer/
  textures/
```

`AvailabilityAction` centralises enabled and disabled CTA behaviour so previews cannot accidentally become clickable.

## 6. Data strategy

Continue to source verified information from the existing profile, Roman, reading, writing and WHOOP modules. Add a Roman v2 presentation adapter rather than duplicating canonical career or project facts.

The page should receive one server-rendered content object. Interactive client components receive only the data they need.

Preview fixtures must:

- Live separately from canonical profile data.
- Be explicitly marked as fixtures in their type.
- Be enabled only on the `/roman-v2` preview route or in development.
- Never be indexed, added to structured metadata or exposed to JJ retrieval as facts.
- Never override real content when real content is available.

Example availability shape:

```ts
type AvailableAction =
  | { available: true; label: string; href: string }
  | { available: false; label: string };
```

## 7. Asset strategy

Do not ship the full-page concept image as the website.

The complete concept inventory, embedded previews and production-art decomposition notes are maintained in the [Roman v2 visual asset index](README.md).

### Approved visual reference map

| Page component | Approved reference | Implementation use |
| --- | --- | --- |
| Full-page structure | [00-full-page-structure.png](concepts/00-full-page-structure.png) | Page rhythm, section order, relative scale and color transitions |
| Hero and floating navigation | [01-hero-approved.png](concepts/01-hero-approved.png) | Hero composition, left-facing figure, navigation shape and first-fold hierarchy |
| Work, over time | [02-work-over-time-approved.png](concepts/02-work-over-time-approved.png) | Career selector, active chapter composition, integrated outcomes and hands artwork |
| Selected products | [03-selected-products-approved.png](concepts/03-selected-products-approved.png) | Featured-project hierarchy, supporting-card grid and terracotta transition |
| Beyond work | [04-beyond-work-approved.png](concepts/04-beyond-work-approved.png) | Reading, Writing, Music and WHOOP composition |
| Talk to JJ | [05-jj-approved.png](concepts/05-jj-approved.png) | Oxblood callout, listening sculpture, voice orb and action placement |
| Final invitation and footer | [06-footer-approved.png](concepts/06-footer-approved.png) | Closing statement, marble hand, footer grid and final inscription |
| Hero identity source | [rakshit-identity-reference.jpg](source-media/rakshit-identity-reference.jpg) | Identity input for production hero artwork; not a public runtime asset by default |

These files are flattened concept references. They must never be imported directly into a runtime page component.

Create individual production assets for:

- Hero: Rakshit as a left-facing Roman marble figure working on a laptop.
- Career: carved hands assembling geometric product blocks.
- Products: Roman stone frame and sculpture fragments around real UI captures.
- Daily reading: sculptural book and paper collage.
- Music: carved hand operating a modern control.
- JJ: listening sculpture and voice-orb composition.
- Footer: reaching marble hand.

Asset requirements:

- Separate desktop and mobile crops where composition requires it.
- No baked-in headings, metrics, buttons or navigation.
- Prefer transparent or cleanly masked artwork layers.
- Export responsive AVIF and WebP variants.
- Preserve identity in the hero artwork, including hair and glasses.
- Use real product screenshots wherever available.
- Build circles, borders, grain, rules and simple halftone fields in CSS when practical.
- Document the generation source and intended placement under `design/roman/`.

## 8. Visual system

### Palette

```css
--paper: #f1eadf;
--paper-light: #f7f2e9;
--sage: #d8ddd2;
--terracotta: #c98b72;
--oxblood: #7d211d;
--ink: #171614;
--muted: #655f57;
--stone: #d8cdbd;
--line: rgba(23, 22, 20, 0.16);
```

Final values should be calibrated against the exported artwork and checked for accessible contrast.

### Typography

- Instrument Serif: primary editorial headlines.
- Figtree: body copy, controls, metrics and utility labels.
- Cinzel: wordmark and small Roman inscriptions only.

Use real text at every breakpoint. Do not render typography inside raster artwork.

### Shared layout

- Maximum content width: approximately 1440px.
- Fluid outer gutters with safe minimums on mobile.
- Strong editorial asymmetry on desktop.
- Native vertical scrolling; no scroll hijacking.
- Sections should remain understandable without motion or artwork.

## 9. Section specifications

### 9.1 Floating navigation

Content:

- Separate `RAKSHIT LODHA` wordmark.
- Compact floating pill with Work, Products, Beyond and Talk to JJ.

Behaviour:

- Sticky on desktop.
- Slightly increases opacity after the hero begins scrolling.
- Indicates the active section with a restrained oxblood marker.
- Talk to JJ opens the existing JJ surface.
- Mobile uses a compact menu without losing the primary JJ action.

### 9.2 Hero

Content:

- Heading: “Product judgment.”
- Supporting line: “I build AI and financial products that turn complicated systems into things people can use.”
- Actions: Explore my work and Talk to JJ.

Artwork:

- Rakshit as a carved Roman marble figure.
- Head, torso, forearms, hands and laptop all face left toward the headline.
- Laptop remains matte black with a restrained halftone transition.

Behaviour:

- Explore my work scrolls to Work, over time.
- Talk to JJ opens the existing JJ voice surface.
- Use one orchestrated initial reveal; no mandatory loader.

### 9.3 Work, over time

Use the approved second iteration rather than the earlier statue-and-black-band design.

Content:

- Paytm Money, ET Money, INDMoney and LearnApp selector.
- ET Money is initially active in the preview because it has the strongest verified evidence.
- Active chapter includes role, concise narrative and three verified outcomes.

Artwork:

- Roman bas-relief hands assembling geometric product blocks.
- No repeated portrait or full human statue.

Behaviour:

- Selector is keyboard accessible.
- Chapter content, artwork and outcomes transition together.
- Metrics remain inside the active chapter; no separate black banner.
- Mobile uses native stacked accordions.

### 9.4 Selected products

Products:

- AI Hiring Chat — featured.
- Krux.news.
- Feedback Intelligence.
- MF Semantic Search.

Behaviour:

- Real destinations are enabled only when a valid URL exists.
- Product without a valid destination remains visually complete but inert.
- No fake `href` values.
- Project screenshots should replace generated fake UI wherever possible.
- Mobile stacks all cards while preserving the featured hierarchy.

### 9.5 Beyond work

This is one combined editorial section containing Daily Reading, Writing, Music and WHOOP.

#### Daily Reading

- Render the final featured-edition composition using a preview fixture when required.
- Keep “Read the latest edition” visible but disabled until a real edition URL exists.
- Do not label a fixture as today’s real publication.

#### Writing

- Render the final list composition with preview fixture rows if no articles are available.
- Rows and “See all writing” remain inert until real destinations exist.
- Fixture titles do not enter metadata, search, sitemap or JJ retrieval.

#### Music

- Reuse the existing music provider and sheet.
- Enable playback only when a real track exists.
- Otherwise retain the final visual composition with an inert control.

#### WHOOP

- Preserve Recovery, Sleep and Strain labels.
- Show em dashes for unavailable values; never show invented numbers or zero.
- Keep the visual structure identical to the eventual live state.
- No rings, health ranking or interpretation.

### 9.6 Talk to JJ

Content:

- Heading: “The portfolio can answer back.”
- Supporting copy about work, decisions, failures and future thinking.
- Voice action and text-question action.

Behaviour:

- Talk to JJ opens the existing voice assistant.
- Text submission routes to `/chat?q=...` when a non-empty question is entered.
- Voice orb responds to hover, listening and speaking states only.
- Microphone permission is requested only after explicit user action.

### 9.7 Final invitation and footer

Content:

- “Let’s build something people actually want to use.”
- Start a conversation.
- Schedule a call.
- Navigation, social links, timezone, back to top and “Festina lente.”

Behaviour:

- Email and social links use verified profile data.
- Schedule a call remains inert until a real scheduling URL exists.
- Back to top uses native smooth scrolling and remains usable without JavaScript.

## 10. Motion and interaction

- Stagger the hero copy and artwork on initial entry.
- Reveal sections on scroll with short opacity and position transitions.
- Crossfade career chapter content instead of moving the entire page.
- Use gentle artwork scale or mask shifts on project hover.
- Do not animate disabled actions.
- Avoid constant background motion, heavy parallax and scroll pinning.
- Respect `prefers-reduced-motion` everywhere.

## 11. Responsive behaviour

Test dedicated compositions at:

- Mobile: 360–430px.
- Tablet: 768–1024px.
- Desktop: 1280–1600px.

Mobile requirements:

- Hero copy and artwork stack without text overlap.
- Hero uses a dedicated crop.
- Career selector becomes an accordion.
- Product cards and Beyond Work modules stack in reading order.
- JJ actions and footer CTAs become full-width touch targets.
- Minimum interactive target size is 44px.
- Essential information never depends on hover.

## 12. Accessibility

- Semantic headings and landmarks.
- Skip link to primary content.
- Visible focus styles on every enabled action.
- Correct `aria-current` for active navigation and career chapter.
- Disabled preview actions removed from the tab order.
- Alternative text describes artwork only when it contributes meaning.
- Decorative texture and halftone layers are hidden from assistive technology.
- Contrast is checked over the actual artwork at each breakpoint.

## 13. Performance

- Server-render the page shell and content.
- Hydrate only navigation, career selector, music and JJ interactions.
- Prioritise only the hero’s required image variant.
- Lazy-load below-fold artwork.
- Supply accurate `sizes` and dimensions to prevent layout shift.
- Keep Three.js and React Three Fiber out of this route.
- Avoid video in the initial implementation.
- Audit bundle size and largest-contentful-paint after final assets are added.

## 14. Implementation phases

### Phase 1 — Foundation

- Add `/roman-v2` route and scoped layout.
- Define presentation types, fixtures and availability logic.
- Establish tokens, typography, responsive grid and section shell.
- Preserve current `/roman` route.

### Phase 2 — Hero and career milestone

- Produce production hero and career artwork.
- Build floating navigation, hero and Work, over time.
- Implement desktop and mobile compositions.
- Validate identity, copy accuracy and career interactions.

### Phase 3 — Products

- Add the four selected projects to the Roman v2 adapter.
- Capture or prepare real product screenshots.
- Build featured and supporting cards with conditional destinations.

### Phase 4 — Beyond work

- Build the final Daily Reading, Writing, Music and WHOOP composition.
- Populate with preview fixtures where real content is not yet available.
- Confirm all unavailable actions are inert.
- Connect real sources as they arrive without altering layout.

### Phase 5 — JJ and footer

- Connect JJ voice and typed-question actions.
- Build the final invitation and footer.
- Enable only verified contact and scheduling destinations.

### Phase 6 — Polish and cutover

- Add restrained motion and active-section navigation.
- Complete responsive, accessibility and performance QA.
- Review `/roman-v2` visually.
- Switch `/roman` only after approval.

## 15. Verification and definition of done

The Roman v2 build is complete when:

1. `node node_modules/typescript/lib/tsc.js --noEmit` passes.
2. `npm run lint` passes.
3. `/roman-v2` renders without runtime or console errors.
4. Desktop, tablet and mobile layouts match the approved Contemporary Roman direction.
5. Hero artwork preserves Rakshit’s identity and left-facing working pose.
6. Career chapters are usable with pointer, keyboard and touch.
7. Every real link works and every unavailable action is genuinely inert.
8. Preview fixtures are never represented as real production content.
9. Missing WHOOP readings render as em dashes, never invented values.
10. Music and JJ reuse the existing providers without duplicating sessions or audio.
11. `/chat` and JJ continue to work after the Roman v2 integration.
12. Reduced-motion mode remains readable and fully functional.
13. Below-fold artwork lazy-loads and the page has no avoidable layout shift.
14. The existing `/roman` remains intact until explicit cutover approval.
15. Every completed section clearly matches its approved visual reference at the reference viewport.
16. Same-size implementation screenshots, overlays and pixel-difference images have been produced for every approved section.
17. A final design review records and resolves every material mismatch in typography, spacing, alignment, color, artwork, borders, radii, shadows, section height and responsive behaviour.
18. The work is not marked complete merely because the code, typecheck and lint pass; reference-image matching and the pixel-by-pixel design review are mandatory completion gates.

## 16. Out of scope for the first build

- Publishing the new experience at `/`.
- New backend services or database infrastructure.
- Browser-based writing or reading CMS.
- WHOOP OAuth onboarding or visitor comparison.
- New chat-agent behaviour unrelated to presentation integration.
- Three-dimensional scenes, scroll hijacking or cinematic page pinning.
- Deleting the original Roman implementation.

## 17. Inputs still required before final activation

The layout can be completed with fixtures, but these inputs are needed to activate all actions:

- Real Daily Reading content and canonical URL.
- Real writing entries and URLs.
- Current WHOOP readings or live connection.
- Verified scheduling URL.
- Final product screenshots and destination URLs.
- Final decision on which contact/social links appear in the footer.

Their absence must not block building or reviewing the final page composition.

## 18. Status and implementation tracker

This tracker is the source of truth for execution progress. The implementing agent must update it in the same change that completes or blocks a task.

### Status vocabulary

| Status | Meaning |
| --- | --- |
| ✅ Done | Work is complete and its local acceptance check passed |
| 🔎 Review required | Implementation exists but has not passed visual or functional review |
| 🟡 Pending | Ready to begin; required inputs and dependencies are available |
| ⬜ Not started | Planned work whose prerequisite phase is not complete |
| ⛔ Blocked | Cannot proceed without a named input, decision or external state change |
| ➖ Not applicable | Confirmed unnecessary; explanation must be recorded |

“Done” is not interchangeable with “implemented.” A UI task remains **Review required** until its reference-image comparison has passed. The overall project cannot be marked Done until the final comparison gate in Section 19 passes.

### Current progress summary

| Area | Status | Evidence / next action |
| --- | --- | --- |
| Contemporary Roman direction | ✅ Done | Approved page direction and visual language |
| Page structure | ✅ Done | Seven-part structure recorded in Section 2 |
| Desktop concept references | ✅ Done | [Visual asset index](README.md) |
| Reference assets stored in repository | ✅ Done | `concepts/` |
| Content availability behaviour | ✅ Done | Fixture and inert-action rules in Section 3 |
| Detailed implementation plan | ✅ Done | This document |
| Production artwork layers | 🟡 Pending | Generate clean section assets without baked-in UI |
| Mobile visual references | 🟡 Pending | Produce and approve dedicated mobile compositions |
| `/roman-v2` application code | ⬜ Not started | Begin with Track A below |
| Data and provider integration | ⬜ Not started | Begins after section shells exist |
| Responsive implementation | ⬜ Not started | Begins with each section, completed in Track H |
| Accessibility and performance QA | ⬜ Not started | Track I |
| Pixel-by-pixel design review | ⬜ Not started | Mandatory Track J completion gate |
| `/roman` cutover | ⬜ Not started | Only after Track J approval |

### Master execution tracker

| ID | Task | Output / acceptance evidence | Dependency | Status |
| --- | --- | --- | --- | --- |
| A1 | Create `/roman-v2` route and scoped metadata | Route renders, is `noindex`, and does not change `/roman` | None | ⬜ Not started |
| A2 | Create Roman v2 types, content adapter and fixture boundary | Typed server payload; fixtures cannot enter canonical profile or JJ data | A1 | ⬜ Not started |
| A3 | Implement `AvailabilityAction` | Enabled link, disabled button and `aria-disabled` cases tested | A2 | ⬜ Not started |
| A4 | Establish CSS tokens, typography and responsive container | Token sheet matches Section 8; no global style leakage | A1 | ⬜ Not started |
| B1 | Prepare final hero artwork | Desktop and mobile AVIF/WebP assets; no baked-in text or controls | Asset map | 🟡 Pending |
| B2 | Prepare final career artwork | Hands-and-blocks assets with clean masks and responsive crops | Asset map | 🟡 Pending |
| B3 | Prepare project framing artwork and real UI captures | Marble frame layers plus verified screenshots | Product URLs/screens | 🟡 Pending |
| B4 | Prepare Beyond Work artwork set | Book, writing crops, music hand and decorative layers | Asset map | 🟡 Pending |
| B5 | Prepare JJ and footer artwork | Listening sculpture, orb treatment and reaching hand | Asset map | 🟡 Pending |
| B6 | Optimize and inventory runtime images | Dimensions, AVIF/WebP variants, sizes and source notes recorded | B1–B5 | ⬜ Not started |
| C1 | Build floating navigation | Desktop pill, mobile menu, active section and JJ action work | A3–A4 | ⬜ Not started |
| C2 | Build hero structure | Native headline/copy/actions, responsive artwork and first reveal | B1, C1 | ⬜ Not started |
| C3 | Verify hero functionality | Scroll CTA, JJ CTA, keyboard and reduced-motion behaviour pass | C2 | ⬜ Not started |
| D1 | Build desktop career selector and active chapter | Four chapters, verified copy, integrated metrics and artwork | A2–A4, B2 | ⬜ Not started |
| D2 | Build mobile career accordions | Native vertical flow with equivalent content and controls | D1 | ⬜ Not started |
| D3 | Verify chapter interactions | Pointer, keyboard and touch checks pass | D1–D2 | ⬜ Not started |
| E1 | Add four selected products to Roman v2 adapter | AI Hiring Chat, Krux.news, Feedback Intelligence and MF Semantic Search | A2 | ⬜ Not started |
| E2 | Build featured and supporting product cards | Native text/actions; no generated fake UI shipped | B3, E1 | ⬜ Not started |
| E3 | Apply action availability rules to products | Missing destination remains visually complete and inert | A3, E2 | ⬜ Not started |
| F1 | Build Daily Reading module in final layout | Real content preferred; preview fixture is clearly isolated; CTA conditional | A2–A4, B4 | ⬜ Not started |
| F2 | Build Writing module in final layout | Fixture rows isolated; unavailable rows and index CTA inert | A2–A4, B4 | ⬜ Not started |
| F3 | Build Music module and connect existing provider | Real track enables playback; missing track leaves inert final composition | A2–A4, B4 | ⬜ Not started |
| F4 | Build WHOOP module | Labels persist; absent readings show em dashes; no invented values | A2–A4, B4 | ⬜ Not started |
| F5 | Compose responsive Beyond Work section | Desktop editorial grid and mobile reading order match spec | F1–F4 | ⬜ Not started |
| G1 | Build JJ callout | Oxblood composition, voice action and text-question action | A3–A4, B5 | ⬜ Not started |
| G2 | Connect JJ and `/chat?q=` behaviour | Existing session opens; valid typed question routes correctly | G1 | ⬜ Not started |
| G3 | Build final invitation and footer | Verified links enabled; unavailable scheduler inert | A3–A4, B5 | ⬜ Not started |
| H1 | Complete desktop layout pass | 1280, 1440 and reference-size captures have no overflow or overlap | C–G | ⬜ Not started |
| H2 | Complete tablet layout pass | 768 and 1024px layouts preserve hierarchy and interactions | C–G | ⬜ Not started |
| H3 | Complete mobile layout pass | 360, 390 and 430px layouts use approved mobile compositions | Mobile refs, C–G | ⬜ Not started |
| H4 | Add restrained motion and reduced-motion alternatives | Motion matches Section 10; disabled actions never animate | H1–H3 | ⬜ Not started |
| I1 | Accessibility review | Landmarks, heading order, focus, keyboard, labels and contrast pass | H1–H4 | ⬜ Not started |
| I2 | Performance review | Responsive loading, lazy loading and layout-shift checks pass | B6, H1–H4 | ⬜ Not started |
| I3 | Regression checks | JJ, music and `/chat` continue to work | G2, F3 | ⬜ Not started |
| I4 | Static checks | TypeScript and lint pass | C–G | ⬜ Not started |
| J1 | Capture final same-size section screenshots | One implementation capture per approved reference | H–I | ⬜ Not started |
| J2 | Generate overlay and pixel-difference images | `actual`, `overlay` and `diff` images stored for every section | J1 | ⬜ Not started |
| J3 | Perform design review and log mismatches | Review covers every category in Section 19 | J2 | ⬜ Not started |
| J4 | Correct and repeat comparison loop | No material unexplained deviation remains | J3 | ⬜ Not started |
| J5 | Approve `/roman-v2` against references | QA report marked approved | J4 | ⬜ Not started |
| K1 | Switch `/roman` to approved v2 composition | Existing functionality remains intact after cutover | J5 | ⬜ Not started |
| K2 | Post-cutover smoke test | Production route, navigation, actions and integrations pass | K1 | ⬜ Not started |

### Tracker maintenance rules

1. Update status when work changes; do not wait until the end of a phase.
2. When marking a row Done, add or link its acceptance evidence.
3. Use Blocked only with a concrete named blocker and the action needed to unblock it.
4. Do not mark a visual section Done before its individual reference review; use Review required instead.
5. Do not mark the project Done while any J-track comparison task remains incomplete.
6. Preserve unrelated existing repository changes and never use destructive Git operations to simplify status.

## 19. Mandatory reference matching and pixel-by-pixel design review

This is a **non-negotiable completion requirement** for the implementing agent.

When implementation work finishes, the agent must first make the rendered website clearly match the approved reference images, then perform a same-size pixel-by-pixel comparison and a documented design review. Passing typecheck, lint and functional tests is necessary but does not satisfy this requirement.

### Reference set

Use the approved files in the [visual asset index](README.md):

- Hero and floating navigation.
- Work, over time.
- Selected products.
- Beyond work.
- Talk to JJ.
- Final invitation and footer.
- Full-page structure for overall rhythm and section transitions.

### Required comparison artifacts

For every section, save the following under `qa/` inside this self-contained Roman v2 folder:

```text
qa/
  hero-reference.png
  hero-actual.png
  hero-overlay.png
  hero-diff.png
  career-reference.png
  career-actual.png
  career-overlay.png
  career-diff.png
  ...
  review.md
```

The reference and actual screenshots must use identical pixel dimensions. The current desktop section references are approximately 1672 × 941px, with the hero reference at 1665 × 944px; use each file’s exact dimensions rather than assuming one universal size.

### Pixel comparison procedure

1. Run the final local build, not a development-loading state.
2. Set the browser viewport and device scale so the implementation capture matches the exact reference dimensions.
3. Capture each section at a deterministic scroll position after fonts and images have loaded.
4. Align the actual and reference images without arbitrary stretching.
5. Produce a 50% opacity overlay.
6. Produce an absolute pixel-difference image.
7. Inspect the overlay and diff at full resolution, not only as thumbnails.
8. Record every material discrepancy in `qa/review.md`.
9. Fix discrepancies, recapture and regenerate the comparison artifacts.
10. Repeat until no material unexplained mismatch remains.

Automated image difference is evidence, not the sole judge. Generated concept artwork and live browser font rasterisation can create harmless pixel noise. The design review must distinguish rendering noise from real composition errors, and every intentional deviation must be documented with a reason.

### Required design-review checklist

The agent must explicitly compare:

- Section width, height and boundary positions.
- Outer gutters, internal padding and grid alignment.
- Headline font, scale, weight, line height, wrapping and baseline.
- Body-copy measure, line breaks and spacing.
- Navigation size, position, opacity, radius, shadow and active state.
- CTA dimensions, border weight, alignment and disabled state.
- Artwork crop, scale, focal point, overlap and halftone transition.
- Background color, texture, circle fields and section transitions.
- Career selector spacing, active marker and chapter proportions.
- Metric size, label alignment and separator positions.
- Product-card hierarchy and real screenshot placement.
- Beyond Work module proportions and reading order.
- JJ composition, orb placement and oxblood contrast.
- Footer grid, reaching-hand position, rules and final inscription.
- Hover, focus, active, disabled and reduced-motion states.
- Desktop, tablet and mobile behaviour.

### Completion gate

The implementation may be declared complete only when:

- All J-track rows are marked Done.
- `qa/review.md` contains the final review result.
- Every approved reference has a corresponding actual, overlay and diff artifact.
- Material discrepancies have been corrected or explicitly approved as intentional.
- The full-page capture clearly preserves the approved hierarchy, rhythm and transitions.

If this comparison has not been performed, the correct project status is **Review required**, not Done.
