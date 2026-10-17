# Roman v2 — final reference comparison and design review (J4 close-out)

- **Date:** 17 Oct 2026. **Branch:** `roman-v2`, base `4456c97` (alpha-keyed artwork) plus the final-pass fixes listed below. Production build served by `next start -p 3060`.
- **Result:** **J4 complete. No material unexplained deviation remains.** Every remaining difference is classified below as intentional, an accepted font difference, blocked on input or noise. **J5 is open: awaiting the user's visual approval.** This review does not approve the page.
- **Reproduce:** `npm run build && npx next start -p 3060`, then `PW_MODULE=<dir>/node_modules/playwright-core node scripts/roman-v2-qa.mjs --base http://localhost:3060`. Chromium headless shell 1217, DPR 1, `prefers-reduced-motion: reduce`. Lazy images are forced to load and decoded before capture. Diff gain ×3.
- **Artifacts (regenerated in this pass):** `qa/<section>-{reference,actual,overlay,diff}.png` for hero, career, products, beyond, jj and footer. Also `qa/full-page-desktop.png`, `qa/full-page-vs-structure.png`, `qa/metrics.json`, `qa/responsive/full-{1920,1440,1280,1024,768,430,390,360}.png` and `qa/responsive/metrics.json`. 1920 was added to the script's responsive widths in this pass.
- **Inspection:** every overlay and diff was read at full resolution as reference-over-actual crops and zooms. Each responsive capture was sliced and read section by section. Element probes and focused screenshots covered the edge cases.

## Summary

Mean absolute RGB difference (0–255) at each reference's exact size. Most of what remains is concept paper grain, halftone jitter, generated-artwork differences and the light product screenshot.

| Section | Ref (w×h) | Height (ref) | Mean diff (J3 → before this pass → **final**) | >32 px share | Status |
| --- | --- | --- | --- | --- | --- |
| Hero + nav | 01 · 1665×944 | 845 (846) | 43.05 → 33.56 → **33.56** | 28.9 % | Pass. Awaiting approval |
| Work, over time | 02 · 1672×941 | 940 (933–941) | 38.53 → 34.29 → **34.29** | 28.1 % | Pass. Awaiting approval |
| Selected products | 03 · 1672×941 | 943 (941) | 39.88 → 58.78 → **58.79** | 38.6 % | Pass with intentional P-2 deviation. Awaiting approval |
| Beyond work | 04 · 1672×941 | 943 (941) | 41.71 → 37.24 → **37.36** | 33.0 % | Pass. +0.12 is the intentional music-player fix (see B-F1). Awaiting approval |
| Talk to JJ | 05 · 1672×941 | 714 (713) | 38.93 → 31.22 → **31.22** | 24.6 % | Pass. Awaiting approval |
| Invitation + footer | 06 · 1672×941 | 877 (845) | 27.80 → 28.67 → **28.67** | 19.5 % | Pass. +32 px height is the intentional Privacy link. Awaiting approval |

No section regressed, apart from two documented changes: beyond +0.12 (B-F1) and products +0.01, which is noise from the tagline colour (P-F1).

Classes used below: **intentional** (deliberate, with a reason), **font** (accepted Instrument Serif face difference, X-6), **blocked** (waiting on a real input from BUILD_PLAN §17), **noise** (grain, rasterisation or a concept artefact), **copy** (deferred to the later copy pass).

---

## 1. Hero + floating nav

**Status:** pass. The overlay registers the figure, laptop, circle, CTAs, body copy, wordmark and pill to within ±2–5 px of the reference.

| Remaining deviation | Class | Reason |
| --- | --- | --- |
| “Product” is ≈0.9× the reference width, and its ascender sits ≈10 px above the reference at a matched baseline (≈336 vs 339) | font | Instrument Serif vs the concept face (X-6). Making the hero larger brings the line collision back (H-1). |
| Chair ends at x≈1550 (ref 1590). The head is proportionally smaller than the concept's | intentional | Accepted generated master (B1). The 1.2× placement fits the body and focal points (hair top 115, laptop 615, brooch ≈1304/403). |
| Rows 845–944 show the career sage, where the reference shows a terracotta band | noise | Reference 01 contradicts 00. 00 is authoritative. |
| Paper grain and halftone dot jitter | noise | — |

**Resolved:** H-1 headline collision, H-2 body, H-3/H-4 (kept), H-5 art scale, placement and visible box (now alpha-keyed, no box at any width), H-6 image dimensions, H-7 ≥1800 alignment, A11y-4 wordmark target.

## 2. Work, over time

**Status:** pass. Card 327–890 (ref 327–889). Title, role, narrative, rule, values and labels are within ±5 px vertically. Timeline dots are within 4 px.

| Remaining deviation | Class | Reason |
| --- | --- | --- |
| “Work, over time.” ink ≈877 px wide (ref 948) | font | X-6 |
| Metric columns at 345 / 744 / 1073 (ref 343 / 660 / 1038) | copy | The real labels (“fewer monthly support tickets”, “AUM on ET Money Earn”) are longer than the concept's, so the columns are content-sized. They settle in the copy pass. |
| The progress dash marks the 2nd chapter (ref marks the 1st while ET Money is active) | intentional | Our dash matches the active chapter. The concept is inconsistent here. |
| “View chapter” is faded and inert | intentional | No chapter destination exists (availability rule). |
| The hands master's forearm and drape rise over the sage above the card. The backdrop's hairline and oxblood marker show faintly through the drape's faded top edge (x≈1285–1530, y≈160) | noise / intentional | Accepted master (B2), placed to the concept box. The line work is at 22 % alpha. |
| At 1280 and 1024 the “View chapter” action wraps to a second row | intentional | Container < 1150 px. The card height absorbs it. |

**Resolved:** C-1 height, C-2 card driver, C-3 rhythm, C-4 type, C-5 metric row, C-6 headline and left edge, C-7 timeline, C-9 action position, C-10 card bleed, C-11 hands art (now alpha-keyed and cropped in the asset script), C-12/X-5 terracotta glow, A11y-5 inactive label contrast.

**Fixed in this pass:**

- **C-F1 (material):** at 1024–1150 the narrative ran onto the art's halftone edge (“products —” and “outcomes.” over the dots). `.narrative` is now `max(35.2cqi, min(24rem, 39cqi))`. The copy clears the art box (44.5cqi) at every desktop width. 1672 is unchanged.
- **C-F2 (material, contrast):** in the ≤899 accordion, “2026—Now” sat on the halftone at 768 (2.9:1 at the 5th-percentile background pixel). The halftone is capped at `min(50vw, 180px)`. “2018—2020” sat on the terracotta glow (4.1:1). The glow is at 0.5 opacity below 900. Both now sample ≥4.5:1.

## 3. Selected products

**Status:** pass with an intentional deviation. Headline, band 401–665, featured title x 140, cards 685–913, arrow boxes and section height 943 all match within ±1–6 px. The real AI Hiring Chat screen sits inside the frame opening. The polygon clip follows the head profile.

| Remaining deviation | Class | Reason |
| --- | --- | --- |
| A light-theme `/chat` screenshot sits where the concept has a fake dark UI. This dominates the mean diff (58.8) | intentional (P-2) | `/chat` has no dark theme, and no fake UI may ship. |
| The Feedback Intelligence card has no device screenshot (only the disc and dots) | blocked (P-7) | The service is suspended. The layout is final. |
| No marble plinths under the supporting devices | intentional (P-8) | The concept plinths contained fake UI. |
| Headline ≈0.8× width. The lede sits ≈14 px below the reference because of the face's deep `p` descender | font | X-6 |
| Band and card left edge at x 67 (ref 76) | intentional | Shared container edge |
| A thin dark rim around the screenshot, and a small dark notch at the window's top centre (the clipped chat avatar) | noise | Real UI clipped by the frame opening |
| The obsolete full-width nav with an “Ideas” item in reference 03 | noise | Not built. 01 is authoritative. |

**Resolved:** P-1 (black window), P-3, P-4, P-5 (vertical), P-6, P-9 (rectangle edge, now alpha-keyed), A11y-5 mobile tagline contrast.

**Fixed in this pass:** **P-F1 (contrast).** At 1280 the featured tagline sampled 4.45:1 where the disc edge meets the band. It is now `#3f312a` (≥4.5:1 at every width).

## 4. Beyond work

**Status:** pass. The grid is within 1 px of the reference (reading 36–1133 × 267–692, writing 1146–1636, music 36–1060 × 706–916, WHOOP 1073–1636). WHOOP labels sit at 1109 / 1267 / 1403 with separators at 1234 / 1370.

| Remaining deviation | Class | Reason |
| --- | --- | --- |
| The music scrubber spans 826–1036 (ref 725–1030), inside the dark panel | intentional (B-F1) | The concept's panel starts at ≈700 with a gradient into the art, but our music master has an opaque card ground. Keeping every player element inside the panel beats letting a line float on the paper. |
| WHOOP shows em dashes plus “Not available” for screen readers, not the reference's placeholder bars | intentional | No reading. Values are never invented. |
| Daily Reading and Writing are PREVIEW fixtures. “Read the latest edition”, the writing rows and “See all writing” are inert | intentional | Availability rule. Fixtures are marked. |
| Writing thumbnails and the WHOOP fragment are interim concept crops | blocked | Real writing entries and WHOOP art are needed (§17). |
| The reading book and column masters differ in scale from the concept. The column continues behind the writing card in the right gutter (x 1636–1672, down to y≈445, soft fade) | intentional | Accepted masters (B4). This reads as depth. |
| “Beyond work” is ≈0.85× width | font | X-6 |

**Resolved:** B-1 to B-11, A11y-6 (“WritingPreview” name), the mobile WHOOP overlap.

**Fixed in this pass:**

- **B-F1 (material):** the player was 303 px wide inside a 240–258 px panel. The scrubber and waveform ran onto the paper card at every width: 75 px at 1672, 93 px at 1280, 125 px at 1920. `.player` is now inset 24 px inside the panel (`left: min(100% − 216px, 537px)`), and the waveform is `min(225px, 100%)`. Verified at 1101, 1280, 1440, 1672, 1920, 1024 and 800.
- **B-F2 (material, text/art overlap):** at 1101–1500 the WHOOP fragment (144 px) covered the “Strain” label (art from x 340 vs label to 379 at 1440). The card is a size container. The fragment is `clamp(72px, 100cqi − 340px, 144px)`, and cards ≤440 px use `max-content` columns with 18 px gutters. The “Strain” text now ends left of the fragment at every width (1101: 275 vs 299, 1280: 275 vs 359, 1440: 275 vs 410). 1672 is unchanged.
- **B-F3 (minor):** the `writing-thumb-mountain` attributes were 100×68 but the file is 100×61. Per-thumb heights are now passed.

## 5. Talk to JJ

**Status:** pass. Height 714 (ref 713). Copy, Talk to JJ (94–304 × 525–595) and the input (319–654) are within 2 px. The orb is centred at (1481, 430).

| Remaining deviation | Class | Reason |
| --- | --- | --- |
| The listener faces left, down toward the copy. The concept's head faces right. Head x≈905–1330 (ref 880–1360) | intentional | Accepted generated master (B5). |
| The headline ink is ≈0.96× width | font | X-6 |
| At 1024–1100, “back.” comes within ≈15–20 px of the hair. It does not overlap | intentional (minor) | The art anchors at 64 % there so the orb stays inside the viewport. |
| The strip below the oxblood in 05 is an older footer variant | noise | 06 is authoritative. |

**Resolved:** J-1 height, J-2, J-3, J-4 orb, J-5 art box (alpha-keyed, concept oxblood `#4f1816` with the darker disc), A11y-3 focus ring on oxblood.

## 6. Final invitation + footer

**Status:** pass. Headline line 2 ink, CTAs (Schedule 474–730 × 437–501), rule 589, separators 542 / 818 / 1094 / 1354, timezone x 1151, fingertip ≈(1200, 470) and cursor tip ≈(1177, 476) all match.

| Remaining deviation | Class | Reason |
| --- | --- | --- |
| Section height 877 (ref 845, +32) | intentional | A fifth footer nav item, **Privacy**, was added with the WHOOP privacy policy (`cdafe3c`). It is required content. |
| Socials order is LinkedIn, GitHub, X (ref LinkedIn, X, GitHub) | copy (F-5) | Data-driven in `content.ts` |
| “Schedule a call” is faded and inert | blocked | No verified scheduling URL (§17) |
| The hand master is smaller relative to the concept's forearm. The fingertip and cursor are aligned | intentional | Accepted master (B5) |
| The dark band below the footer in 06 (black spacer in the capture) | noise | — |
| Line 1 ascender ≈8 px high, ≈0.9× width | font | X-6 |

**Resolved:** F-1 to F-4, F-6 to F-9, A11y-4 footer touch targets, X-4 containers.

**Fixed in this pass:** **F-F1 (material, text/art overlap).** On tablet (768–1023) the 38 vw hand sat behind “use.” in the headline. It is now 30 vw at `top: −2.5vw`, so the fingertip ends above line 2 and right of “something”. Checked at 768, 900 and 1020.

---

## Full-page rhythm (vs `00-full-page-structure.png`)

`qa/full-page-vs-structure.png`: same seven-part order, alternating grounds (paper → sage → paper/terracotta → sage → oxblood → paper), the same artwork side per section and the same transitions, including the career-to-products terracotta glow. Page height at 1672 is 5265 against the 00 rhythm of ≈5113 (×3.357). The difference is products (+94, following 03 rather than the 00 thumbnail) and the footer (+32, Privacy). **Hierarchy, rhythm and transitions are preserved.**

## Cross-section

| # | Item | Final |
| --- | --- | --- |
| X-1 | Section heights | Hero 845, career 940, products 943, beyond 943, JJ 714, footer 877. All within ±3 px of their reference, except the footer (intentional, +32). |
| X-2 | First text column at 1672 | 107 / 89 / 99 / 90 / 94 / 87. Matches the reference variance. |
| X-3 | ≥1800 alignment | At 1920: hero copy 235, wordmark 237, container sections 192. The hero keeps the reference's +20 px offset. |
| X-4 | Containers | The shared `--container-max` 1680 everywhere. Beyond keeps its own wider inner container by design. |
| X-6 | Headline face | Accepted font difference. Per-section letter-spacing and size compensation is applied. |

## Responsive (H1–H3)

`scrollWidth === clientWidth` and no unclipped overflowing element at **1920, 1440, 1280, 1024, 768, 430, 390 and 360** (`qa/responsive/metrics.json`). Each capture was reviewed section by section after the fixes:

| Width | Result |
| --- | --- |
| 1920 / 1440 / 1280 | No text/art overlap. The career card bleeds to the viewport up to 1680, then ends with the container. The art fades at the card edge. The music player sits inside its panel. The WHOOP fragment clears “Strain”. |
| 1024 | No overlap. The career narrative clears the art (C-F1). The JJ heading is ≈15–20 px from the hair. Products uses the large stacked stage, as designed. |
| 768 | No overlap. The tablet footer hand clears the headline (F-F1). The career accordion contrast is fixed (C-F2). JJ stacks below the copy. |
| 430 / 390 / 360 | No overlap. The hero stacks copy above art. Accordions, full-width CTAs, music art fill and the 56 px WHOOP fragment all work. On Krux the dot texture (not artwork) sits behind the wrapped tagline. That is decorative texture, and contrast passes. |

## Accessibility (I1)

| Check | Result |
| --- | --- |
| Landmarks | `header`, `nav[Primary]`, `main#main`, `footer#contact` with `nav[Footer]`, and labelled accordion regions. The skip link is the first stop. ✓ |
| Heading order | h1 → h2 (Work) → h3 chapters → h2 Products → h3 ×4 → h2 Beyond → h3 ×4 → h2 JJ → h2 footer. No skipped levels. ✓ |
| Focus visible | Keyboard Tab walk at 1672, 1024, 768, 390 and 360: 26–27 stops, **every stop has an outline**. In JJ, Talk to JJ, the question field (ring on `.ask`) and the mic button show a 2 px `#f7f2e9` ring, confirmed by screenshot. ✓ |
| Disabled not focusable | 0 disabled or `aria-disabled` elements in any Tab walk. ✓ |
| Touch targets | 0 enabled controls under 44×44 at 768, 390 and 360. Accordion headers are 68 px. Below-1024 checks are clean. ✓ |
| Contrast over the actual background | 5th-percentile background luminance sampled under every text run with text hidden, at 1920, 1440, 1280, 1024, 768, 430, 390 and 360. **All visible text is ≥4.5:1** (≥3:1 for large) after C-F2 and P-F1. Inert actions are excluded because they are disabled by design. ✓ |
| Career tabs | ArrowDown moves selection and focus (ET Money → INDMoney). End and Home work. Inactive panels are `inert`. ✓ |
| Mobile accordions | Click and Enter toggle `aria-expanded`. ✓ |
| Mobile menu | Opens with `aria-expanded=true`. Escape closes it. ✓ |
| Reduced motion | All captures use `reduce` and render fully. With motion on, all 6 `[data-reveal]` end `shown` after scrolling. ✓ |

## Behaviour and performance (I2, I3)

| Check | Result |
| --- | --- |
| Explore my work | `#work`, section top at y 96 (nav offset). ✓ |
| JJ question | “What did you build at ET Money?” + Enter → `/chat?q=What%20did%20you%20build%20at%20ET%20Money%3F`. An empty submit stays on the page. ✓ |
| Music | “Play a track” drives the existing provider. Exactly **one `<audio>`** before and after, playing `open-it-up.mp3` (not paused). ✓ |
| Console | 0 errors and 0 page errors at every width and through all interactions. ✓ |
| Loading | Only the hero `<img>` is `eager` with `fetchpriority=high`. All 18 other images are `lazy`. ✓ |
| Dimensions | Every `<img>` width/height ratio matches the decoded file (after B-F3). The mobile `<source>` attributes match (hero 1254², JJ 1122×1402). ✓ |
| CLS | 0 (layout-shift observer, full scroll). ✓ |
| Nav active marker | `aria-current="location"` on Work, Products and Beyond in turn. JJ has no nav link: “Talk to JJ” is an action. ✓ |
| Static checks | `tsc --noEmit`, `eslint src/components/roman-v2 src/lib/roman-v2 scripts` and `npm run build` pass. ✓ |

## Needs the user's input

1. **J5 visual approval** of `/roman-v2` against the references (only the user can approve).
2. Inputs from §17 that would activate the remaining inert or interim items: a Feedback Intelligence screenshot, real Daily Reading and writing entries, a verified scheduling URL, WHOOP readings, and the final footer socials order.
3. The copy pass, for example the outcome labels that make the career metric columns wider than the concept's.

## Artifact sizes

- `qa/*.png`: 26 files, **55.6 MB**. That is 24 section artifacts at **48.7 MB** plus the two full-page images at 7.0 MB.
- `qa/responsive/*.png`: 8 files, **20.7 MB**. The 1920 capture is the largest at 4.9 MB.
- The PNGs are regenerable and are not committed.
