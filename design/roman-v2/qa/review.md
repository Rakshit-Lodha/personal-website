# Roman v2 — reference comparison and design review (J1–J3)

- **Date:** 17 Oct 2026, 10:38–10:44 IST. **Branch/commit:** `roman-v2` @ `bc9d958`. Production server `:3030` (`.next/BUILD_ID` 10:25).
- **Result:** **Review required. Not approved.** Material mismatches remain in every section (listed below). J4 and J5 stay open.
- **Reproduce:** `PW_MODULE=<dir>/node_modules/playwright-core node scripts/roman-v2-qa.mjs --base http://localhost:3030 [--only hero,career]`. See the script header. It captures with Chromium headless shell 1217 at DPR 1 with `prefers-reduced-motion: reduce`. It forces lazy images to load and waits for fonts and image decode.
- **Artifacts:** `qa/<section>-{reference,actual,overlay,diff}.png` for hero, career, products, beyond, jj and footer. Also `qa/full-page-desktop.png`, `qa/full-page-vs-structure.png` (00 concept beside our page scaled to 498 px), `qa/metrics.json`, `qa/responsive/full-{1440,1280,1024,768,430,390,360}.png` and `qa/responsive/metrics.json`. The diff gain is ×3.

## Capture method and alignment

| Section | Reference (w×h) | Viewport | Alignment | Notes |
| --- | --- | --- | --- | --- |
| hero | 01 · 1665×944 | 1665×944 | scrollY 0, nav visible | Our hero is 845 px tall, so rows 845–944 show the career sage. The reference shows a terracotta band there, which the 00 structure contradicts. Treat as noise. |
| career | 02 · 1672×941 | 1672×941 | `#work` top at y=0, nav hidden | |
| products | 03 · 1672×941 | 1672×941 | `#products` top at y=0, nav hidden | 03 shows an obsolete full-width nav variant with a “Ideas” item. Not built, intentionally. |
| beyond | 04 · 1672×941 | 1672×941 | `#beyond` top at y=0, nav hidden | |
| jj | 05 · 1672×941 | 1672×941 | `#jj` top at y=0, nav hidden | The strip below the oxblood in 05 is an older footer variant. 06 is authoritative. |
| footer | 06 · 1672×941 | 1672×941 | `#contact` top at y=0, nav hidden, black spacer below the page | 06 shows a dark band below the footer that 00 does not have. Treat as noise. |

Mean absolute RGB diff per section (0–255): hero 43, career 39, products 40, beyond 42, jj 39, footer 28. These numbers are dominated by artwork and grain, so judge each section by the tables below rather than by them.

> **Artwork note (coordinator, 10:4x):** the 11 artwork layers were replaced with generated masters (new aspect ratios) **while this pass was running**. The public files on disk changed at 10:37, and `next start` serves `public/` from disk, so the **captures above already show the new art**. Every artwork crop, scale or placement finding is tagged **`stale – artwork replaced`**. Each one records the **reference position** so fix agents can place the new art against it. Typography, layout, spacing, colour, responsive, a11y and performance findings are not affected.

Severity: **material**, **minor**, **noise** (rasterisation, grain or concept artefact) or **intentional** (accepted deviation). Unless stated otherwise, coordinates are px in the 1672-wide capture with the section top at y=0.

---

## 1. Hero + floating nav (`Hero.module.css`, `FloatingNav.module.css`)

| # | Category | Reference | Actual | Severity | Fix |
| --- | --- | --- | --- | --- | --- |
| H-1 | Headline scale / line height | “Product” ascender→baseline 231→339 (108 px), width 106–570 (464). “judgment.” ink 347–487, x 88–682. Gap between lines: 8 px. | “Product” 206→339 (133 px, **+23 %** taller), width 110–555 (445). “judgment.” ink 330–497. The **j-dot (y 330) rises 9 px above the “Product” baseline (339)**, so the lines collide. | material | `Hero.module.css .title`: font-size `calc(10.9*var(--u))`→`calc(9.6*var(--u))` (≈160 px at 1665). line-height `0.66`→`0.76`. letter-spacing `-0.035em`→`-0.012em` so width stays ≈450–460. Move the block so the “Product” ascender sits at y≈231: `.copy bottom` `7.8u`→`7.4u`, then re-check that the CTAs stay at y 658. |
| H-2 | Body copy | Lines at y 514/553/591 (pitch 38.5). Line 1 x 110–540. | 509/548/587 (pitch 39). Line 1 ends ≈527. | minor | `.body font-size` `1.8u`→`1.85u` (≈30.8 px). Settles once H-1 moves the block. |
| H-3 | CTAs | Explore 109–344 × 658–715. Talk to JJ 368–541. | 107–341 × 658–714. 366–544. | noise | none |
| H-4 | Wordmark / nav pill | Wordmark ink x 109–345, y 44–59. Pill x 921–1583, y 22–86. | 111–342, y 45–60. Pill 919–1584, 22–86. Active marker absent at the top (correct). | noise | none |
| H-5 | Artwork scale / placement — `stale – artwork replaced` | Figure (concept): hair top y≈115, head x 1005–1290, laptop left edge x≈615, chair right x≈1590, bottom-aligned at y 845. The crop box is 560,95 → 1665,843. The circle `#ecdecf` has centre (1247,450) and r 507 and is visible behind the head. | New master: head x 1215–1425, hair top y≈145, laptop left x≈870. Figure ≈0.79× the reference size and pushed right. The CSS circle is almost hidden: only a sliver at the top right. Faint ghost tiles and a lighter rectangular box show at x 600–900 (art box edge, `#f4e8d8` vs paper `#f4ebdf`). At 1024 the box edge shows at x≈355. | material (stale) | Re-crop the master in `scripts/prepare-roman-v2-assets.mjs` so the figure fills the 1105-wide export like the reference (laptop left edge at about 5 % of the width, hair top at about 3 %). Alternatively raise `.art width` to ≈84u and offset right. Fade the master background to full transparency. Keep `.circle` centred at (1247,450) with r 507. |
| H-6 | Image dimensions | — | `<img width=1105 height=748>` but the file is 1105×737. The mobile `<source>` says 850×748 but the file is 850×850. | minor (stale) | `Hero.tsx`: update the `width`/`height` attributes to the new files (1105×737, mobile 850×850). |
| H-7 | Wide screens (≥1800) | — | `--u` caps at 18 px. At 1920 the hero copy sits at x 115 and the wordmark at 125, but every 1680-container section starts at x 192–223. | material (cross-section) | `Hero.module.css .copy left`: `calc(max(0px, (100vw - 1680px)/2) + 6.4*var(--u))`. Apply the same to `.root` wordmark padding in `FloatingNav.module.css`. |

## 2. Work, over time (`CareerJourney.module.css`)

| # | Category | Reference | Actual | Severity | Fix |
| --- | --- | --- | --- | --- | --- |
| C-1 | Section height | 00 rhythm: 933 px. The 02 card ends at y 889 inside a 941 frame. | **1091 px**. The card is 338→1041 (703 tall vs 562), so the metric labels fall below the 941 frame. | material | Fix C-2 to C-5. Target section height ≈940 and card height ≈560. |
| C-2 | Card height driver | — | All four tabpanels are stacked in one grid cell, so the card takes the **tallest** chapter. LearnApp’s title wraps to 3 lines (246 px) and the ET Money label “fewer monthly support tickets” wraps to 2 lines. | material | `.chapterTitle`: `max-width` 486→≈540 px (or `text-wrap: balance` with a 2-line cap) so no title exceeds 2 lines. `.outcomeLabel`: single line, either wider columns (see C-5) or `white-space: nowrap` with font 21 px. |
| C-3 | Card vertical rhythm | Title ink 374–520. Role 538–567. Narrative lines 593/627/661. Rule y 710. Values 740–815. Labels 831–852. Card bottom 889. | Title 386–539. Role 575–598. Narrative 636/669/703. Rule 798. Values ≈840–915. Labels 937+. | material | `.role margin-top` → 14 px. `.narrative margin-top` → 22 px. `.footer` (outcome row) margin-top → 26 px with rule-to-value gap 30 px. Card padding-bottom → 36 px. |
| C-4 | Role / narrative type | Role ≈30 px. Narrative ≈26.5 px, line pitch 34 px, wraps “…lending and wealth / products — built from first principles / and scaled to real outcomes.” (line 1 width 480 px). | Role 26.9 px. Narrative 23.4 px, 33.2 lh, wraps differently (line 1 width 417). | material | `.role font-size` → 30 px. `.narrative font-size` → 26.5 px, `line-height: 34px`, `max-width: 490px`. |
| C-5 | Metrics row | Values cap 740–815 (≈75 px). Columns at x 343 / 660 / 1038, separators at 622 / 996. Labels ≈24.7 px. | Values 94.6 px Instrument Serif. Columns 348 / 682 / 995, separators 644 / 957. Labels 22.6 px. | minor | `.footer` grid columns → `316px 376px 1fr auto` (from x 343). `.outcomeLabel font-size` → 24 px, one line. |
| C-6 | Headline | “Work, over time.” x 79–1027 (948 wide). “over time.” t-top→baseline 123–227. Lede x 92–1058 at y 256–287. | x 70–825 (755 wide, **0.80×**), 108–216. Lede x 73–936 at 260–288. | material | `.title`: font-size 152→≈162 px (`clamp(…, 9.7vw, …)`), letter-spacing −0.035em→−0.005em. That gives ≈880–900 px width with cap height still within ±6 %. **Shift left edge +18 px**: the headline and lede should start at x≈90 (now 72). Set `.inner padding-inline` to 90 px at ≥1600 (or `clamp(16px, 5.4vw, 90px)`). |
| C-7 | Timeline | Dots centred x≈75 at y 365/484/607/731. Labels uppercase, period “2026—NOW” with no spaces, letter-spaced. | Dots centred x 81 at 380/499/619/738. Period “2026 — Now” mixed case. | minor | `.dot` left −6 px. Timeline top −14 px. `.period { text-transform: uppercase; }`. Use `—` without spaces in content or CSS. |
| C-8 | Active chapter marker | Oxblood filled dot ≈19 px, oxblood label and period. | Same. | — | none |
| C-9 | “View chapter” | Enabled oxblood button 1386–1605 × 744–804, 4 progress dashes below. | Disabled (opacity .5) at 1318–1538 × 834–894. | intentional (no destination) + minor position | Position follows C-3. The right edge should align to the card padding at 1605 (now 1538): `.footer` right padding 0. |
| C-10 | Card left/right | Card x 279–1605, top 327. | 286–1600, top 338. | minor | `.card margin-left` −7 px, top −11 px. |
| C-11 | Hands artwork — `stale – artwork replaced` | Concept crop 860,333 → 1672,690. Left hand x 870–1180, right hand and drape 1230–1672, block baseline y≈670. The art bleeds past the card’s right edge to 1672. | New master shows the right hand only, x≈1110–1665, y 343–790. A light rectangular box shows outside the card at x 1600–1665 (box edge). Ghost tiles at x 870–1100. | material (stale) | Fade the master’s left, bottom and right edges to transparent in the prepare script. Match the bounds 860–1672 × 333–690 at 1672. Update `width/height` attrs 812×357 → 812×457. |
| C-12 | Bottom transition | Terracotta glow at the bottom right of 02 and 00 (lead-in to products). | None. Flat sage. | minor | Optional `radial-gradient(… #c98b72 0.25 …)` at the bottom right of `.section`. |

## 3. Selected products (`SelectedProducts.module.css`)

| # | Category | Reference | Actual | Severity | Fix |
| --- | --- | --- | --- | --- | --- |
| P-1 | Featured screenshot | Window shows the product UI inside the frame. Concept opening ≈ (984,158)→(1467,562). | **The window is solid black. The real AI Hiring Chat screenshot is invisible** because the new frame master has an opaque dark opening that covers `.window`. | **material** | Either key the opening to alpha in `prepare-roman-v2-assets.mjs` (luminance < 35 connected to the centre) or put `.window` above `.frame` (`z-index`). Then refit `.window` to the new opening, measured at 1672 with the frame box at (689,27) 966×644: opening bbox (983,150)→(1517,519), i.e. **left 30.4 %, top 19.1 %, width 55.3 %, height 57.3 %**. Recompute `clip-path` (the top edge slopes from y≈204 at x 1050 to y≈150 at x 1450, and the left edge is hidden by the head at x 983–1075). |
| P-2 | Featured screenshot tone | Dark UI in the frame. | The real capture is a light UI. On the old art it read as a bright white slab. | minor | Prefer a dark-mode capture of `/chat` if the product supports it. Otherwise keep it, since it is real UI. |
| P-3 | Headline width | “Selected” 105–536 (431), “products” 98–546 (448). Ascender y 116. | 104–445 (341, **0.79×**), 101–475 (374). Ascender y 102. | material | `.title`: letter-spacing → −0.008em, font-size +6 %. Keep the baseline of “products” at y≈330 (now 331). |
| P-4 | “AI Hiring Chat” | x 141–667 (526 px), cap 450–517. | x 135–459 (324 px, **0.62×**), cap 448–517. | material | `.featuredTitle`: font-size +12 % (≈80 px at 1672), letter-spacing 0. Accept the residual face difference. Left edge +6 px (to 141). |
| P-5 | Featured band | Band x 76–(behind frame), y 401–665. | x 72–1672, y 401–669. | minor | `.featured` left +4 px. |
| P-6 | Supporting cards | Cards 76–559 / 581–1076 / 1097–1596, y 684–911. Titles at 104/606/1122 x, y≈720. Arrow boxes 104–158 × 827–867. | 72–566 / 589–1082 / 1105–1599, y 690–915. Titles 100/616/1133. Arrows 100–154 × 841–885. | minor | Gap 22→20 px, cards top −6 px. `.cardAction margin-top` −14 px. |
| P-7 | Feedback Intelligence thumbnail | Device mock with dashboard. | Empty: circle and dots only. No screenshot exists in `content.ts` (`feedback-agent`). | intentional / ⛔ input | Needs a real capture (BUILD_PLAN §17). Layout is already final. Do not add fake UI. |
| P-8 | Card plinth / marble art | Marble plinths under each device. | None. Dropped in ASSETS.md because the art contained fake UI. | intentional | — |
| P-9 | Frame art — `stale – artwork replaced` | Concept crop 690,78 → 1650,668. Head profile x 740–1000, frame outer 790–1595 × 85–655. Terracotta circle `#b26e58` behind. | The new master ground `#ab694e` vs CSS circle `#b26e58` leaves a visible rectangle edge at y≈30 (x 700–1672). Image 960×640 vs attrs 960×590. | material (stale) | Fade the master ground to alpha or match `--products-circle` to `#ab694e`. Update attrs to 960×640. |

## 4. Beyond work (`BeyondWork.module.css`)

| # | Category | Reference | Actual | Severity | Fix |
| --- | --- | --- | --- | --- | --- |
| B-1 | Grid | Reading 36–1133 × 267–692. Writing 1146–1636 × 267–692. Music 36–1060 × 706–916. WHOOP 1072–1636 × 706–916. | Reading 36–1135 × 272–699. Writing 1149–1636. Music 36–1051 × 713–922. WHOOP 1064–1636 × 713–922. | minor | Row 1 top −5 px, row 2 top −7 px. Music/WHOOP split at 1060/1072: `grid-template-columns` → `1024fr 564fr`. |
| B-2 | Headline | “Beyond” 91–459. “work” 501–781 (280 wide). | “Beyond” 95–459. “work” 437–665 (228). Word-space is narrower. | minor | `.title` letter-spacing → −0.01em, `word-spacing: 0.08em`. |
| B-3 | Daily Reading copy block | Eyebrow y 314. Title ink 350–480. Dek y 517. CTA 76–382 × 567–629. | Eyebrow 321. Title 365–505. Dek 549. CTA 75–359 × 595–656. | material | `.readingTitle margin-top` −14 px. `.readingDek` margin −8 px. CTA: padding-inline 30 px so the width is 306, and top −28 px. |
| B-4 | Writing module | Lede y 337. Rows 372–455 / 460–540 / 546–612. See-all 1180–1602 × 628–672. | Lede 349. Rows 390 / 475 / 560. See-all 1183–1601 × 637–682. | minor | `.writingLede` −12 px. Row block −18 px. See-all −9 px. |
| B-5 | WHOOP columns | Labels baseline y≈800 (card-relative 86). Columns at x 1109 / 1265 / 1405. Separators 1234 / 1370. | Labels at y≈815 (card-relative 102). Columns 1098 / 1238 / 1348. Separators 1207 / 1316. | material | `.whoopGrid`: padding-left +11 px, columns `156px 140px 1fr`, `margin-top` −16 px. Em dashes are **intentional** (no reading). |
| B-6 | WHOOP sage circle | Sage circle (`#c0bfae`) behind the fragment at the top right of the card. | Missing. | minor | Add a `::before` circle with r≈90 centred at (1590,740) in `.whoop`. |
| B-7 | Music | Hand and knob in 300–800. Player panel 800–1060. Waveform, scrubber and transport. | Panel 802–1051. Player content matches. | minor | Follows B-1. |
| B-8 | Music on mobile (≤767) | — | **The player panel renders as an empty black slab** at the right of the art strip (390 capture, y≈4400). The waveform and controls are missing. | material | `BeyondWork.module.css @media (max-width:767px)`: either show the waveform/controls in the panel or hide the panel and let `.musicArt` fill the width. |
| B-9 | “PREVIEW” badges | — | Present on Daily Reading and Writing. | intentional (fixture marker) | Heading accessible name reads “WritingPreview” (see A11y-6). |
| B-10 | Artwork — `stale – artwork replaced` | Column/leaf crop 860,0 → 1672,266. Reading 548,272 → 1132,691. Music 290,706 → 806,916. WHOOP fragment 1492,708 → 1636,914. | The column box shows a hard vertical edge at x≈890 (`#c0bcaa` art vs `#ddd7c9`). Reading has ghost tiles at x 560–760. Music art 516×290 vs attrs 516×210. Column 812×457 vs attrs 812×266. Reading 584×389 vs attrs 584×419. | material (stale) | Fade the master edges. Update `width/height` attrs in `BeyondWork.tsx`. |
| B-11 | Mobile header art | — | At 390 the column art sits behind “work” and the lede. Lede contrast p05 3.4:1. | minor | At ≤767 cap the column art to the right 40 % or add a paper scrim behind `.header` text. |

## 5. Talk to JJ (`JJCallout.module.css`)

| # | Category | Reference | Actual | Severity | Fix |
| --- | --- | --- | --- | --- | --- |
| J-1 | Section height | 713 (05). 00 rhythm: 708. | **738** (+25). The copy, actions and art all sit ≈23 px lower. | material | Reduce `.section` padding-block so the height is 713 (−25 px, split between top and bottom). |
| J-2 | Headline | Ink x 92–850, lines “The portfolio” / “can answer back.” | x 96–762 (0.88×). | minor | letter-spacing → −0.01em, font-size +4 %. |
| J-3 | Body / actions | Body lines 419–446, 459–480. Talk 95–305 × 525–593. Input 320–654 × 525–593. | Body 442/482. Talk 94–304 × 548–617. Input 319–654 × 548–617. | material | Follows J-1. Sizes already match (±1 px). |
| J-4 | Orb | Centre (1481,430), r≈80, glow ring. | Centre (1481,466). Size matches. | minor | Follows J-1. Keep at 1481/430. |
| J-5 | Listener art — `stale – artwork replaced` | Concept crop 670,20 → 1672,712. Head x 880–1360, hair top y≈45, ear/hand x 950–1080, bottom-aligned. Darker circle `#491614` behind the head. | New master: head x 1060–1340, top y≈190 (smaller, further right). **The art box shows as a lighter rectangle** x 720–1672 × 85–738 (`#591210` vs section `#4f1816`). | material (stale) | Key the master ground to alpha or set the section bg to the master ground. Scale so the head spans 880–1360. Update attrs 1002×692 → 1002×668 and mobile 560×682 → 560×700. |

## 6. Final invitation + footer (`ClosingFooter.module.css`)

| # | Category | Reference | Actual | Severity | Fix |
| --- | --- | --- | --- | --- | --- |
| F-1 | Headline | Line 1 “Let’s build something” x 91–1021, ascender y 187, baseline ≈279. Line 2 x 82–1202, ink 290–405. | Line 1 x 90–939 (0.91×), ascender 170. Line 2 89–1174 (0.97×), 289–408. | minor | `.title` letter-spacing −0.025em → −0.012em. Line 1 starts 17 px too high: `padding-block-start` +10 px and line-height 0.94 → 0.9. |
| F-2 | CTAs | Start a conversation 90–426 (serif, ≈36 px, 2 px underline at y≈490). Schedule 474–729 × 438–501. | 88–362. Schedule 411–667 × 452–515 (**63 px left, 14 px low**). | material | `.ctas .conversation` font-size `clamp(…, 2.2vw, 2.375rem)` → 40 px at 1672 (`2.4vw`), letter-spacing 0. `.ctas margin-top` −14 px. Schedule then lands at ≈474. |
| F-3 | Top rule / grid | Rule y 590. Column separators 542 / 818 / 1094 / 1354. Bottom rule 788. | Rule 604, separators 542 / 818 / 1094 / 1354 (exact), bottom rule 793. | minor | `.grid margin-top` −14 px. `padding-block` 34/36 → 34/27. |
| F-4 | Footer nav list | Work / Products / Beyond work / Talk to JJ at y 642 / 675 / 707 / 739 (pitch 32), top-aligned. | 653 / 682 / 712 / 741 (pitch 29.5). | minor | `.list` gap → 6 px (line pitch 32), `justify-content: flex-start`, top +11 px. |
| F-5 | Socials | Order LinkedIn, X, GitHub at y 642 / 679 / 716, top-aligned. | LinkedIn, GitHub, X at 664 / 696 / 728 (centred). | minor | Content order in `content.ts` → LinkedIn, X, GitHub, top-aligned like F-4. |
| F-6 | Timezone / back to top | “India · IST” x 1151, “Back to top” 1460–1600. | 1183 (centred), 1473–1605. | minor | `.timezone` → `align-items: flex-start`, padding-left 56 px. `.top` padding-right 0 (ends at 1600). |
| F-7 | Motto | “FESTINA LENTE | Make haste slowly.” baseline y≈820, latin x 72. | y≈829. | minor | Follows F-3. |
| F-8 | Cursor | Red arrow cursor at (1195,497) with glow. README says the cursor “remains native UI”. | Missing (removed from the art, never rebuilt). | minor | Add an inline SVG cursor (`aria-hidden`), 30×40, `#7d211d`, with a drop-shadow glow, at `left: 71.5vw; top: 497px` on desktop. Hide below 1024. |
| F-9 | Hand art — `stale – artwork replaced` | Concept crop 1182,30 → 1672,570. Fingertip at (1200,470), forearm exits at the top right. Circle `#e5d9cc` with centre (1295,345) and r 320 (CSS circle matches: 975–1615 × 25–665). | New master: fingertip at (1292,345), much smaller. **The square art box shows** x 1187–1672 × 35–515 (`#e2d4c7` over the circle `#e6dacd` and the paper `#f0e8dd`). File 490×490 vs attrs 490×540. | material (stale) | Key the ground to alpha. Scale so the fingertip lands at (1200,470). Attrs → 490×490. |

---

## Cross-section consistency

| # | Item | Measurement | Severity | Fix |
| --- | --- | --- | --- | --- |
| X-1 | Section heights vs 00 rhythm (×3.357 → 1672 px) | Hero 846 → **849** ✓. Career 933 → **1091 (+158)**. Products 849 → **950 (+101)** (but 03 itself is ≈941, so follow 03). Beyond 933 → 950 (+17). JJ 708 → **738 (+30)**. Footer 843 → 864 (+21). Page 5113 → 5441. | material (career, jj) | C-1, J-1. Footer: F-2/F-3 recover ≈25 px. |
| X-2 | Left edge of the first text column at 1672 | Ref: hero 108, career **90**, products 100, beyond 90 (cards 36), jj 94, footer 88 (rule 67). Actual: 107, **72**, 99, 92 (36), 94, 87 (67). | material (career only) | C-6. |
| X-3 | Wide viewport (1920) | Hero copy 115 and wordmark 125, while career/products/footer start at 192–219 and beyond at 216. | material | H-7. |
| X-4 | Containers | Career, products, JJ and footer use a local `max-width: 1680px`. Beyond uses `1600 + 2·pad`. Hero is unbounded (`--u`). The shared `.container` (1440) is overridden everywhere. At 1440 the left edges are 92 / 65 / 88 / 81 / 81 / 75. That roughly matches the reference variance, so this is not by itself an error. | minor | Introduce a single `--content-max: 1680px` token in `contemporary-roman.module.css` and use it in all six sections, so edges move together above 1680. |
| X-5 | Transitions | Hero paper → career sage ✓. Career → products: the reference has a terracotta glow at the bottom right, actual is flat (C-12). Products → beyond ✓. Beyond sage → JJ oxblood ✓. JJ → footer ✓. | minor | C-12. |
| X-6 | Headline face | Instrument Serif renders **0.62–0.97× the reference width** at equal cap height. Hero is the exception: it is 23 % taller. Section headings average ≈0.82×. | material (aggregate) | Accepted face difference. Apply the per-section compensation above: letter-spacing −0.035em → ≈−0.01em, plus a 4–12 % size increase where noted. Do **not** change the hero size upward. |

## Responsive (H1–H3)

`document.documentElement.scrollWidth === clientWidth` at **1672, 1440, 1280, 1024, 768, 430, 390 and 360: no horizontal overflow ✓**. All off-canvas decorative elements are clipped by `overflow:hidden` ancestors.

| Width | Result | Issues |
| --- | --- | --- |
| 1440 / 1280 | Pass with section issues above | Same composition issues as 1672. The footer hand box seam is visible (F-9). |
| 1024 | Pass | The hero art box edge is visible at x≈355 (H-5). The products frame is very large and the window is black (P-1). |
| 768 | Pass (tablet stacked) | Footer nav/social/back-to-top links are 26 px tall (**< 44 px touch target**). See A11y-4. The JJ sculpture stacks below the copy ✓. Career becomes an accordion ✓. |
| 430 / 390 / 360 | Pass with issues | Hero copy and art stack with no overlap ✓. Career accordion ✓. Products: the featured tagline sits on terracotta (**2.7:1**, A11y-5) and the window is black (P-1). Beyond: music player slab is empty (B-8). Column art sits behind the heading (B-11). The WHOOP fragment overlaps the “Strain” column (minor: move the fragment below the metrics or reduce it to 96 px). JJ and footer CTAs are full width ✓. The wordmark link is 22 px tall (A11y-4). |

## Accessibility (I1)

| # | Check | Result | Severity | Fix |
| --- | --- | --- | --- | --- |
| A11y-1 | Landmarks / skip link | `header`, `nav[Primary]`, `main#main` (hero, work, products, beyond, jj), `footer#contact` with `nav[Footer]`. The skip link “Skip to content” is the first tab stop ✓. | pass | — |
| A11y-2 | Heading order | h1 Product judgment → h2 Work, over time → h3 ×4 chapters (3 inert) → h2 Selected products → h3 ×4 → h2 Beyond work → h3 ×4 → h2 JJ → h2 footer. No skips ✓. | pass | — |
| A11y-3 | Focus visibility | Every enabled stop shows a ring. **JJ section: the global ring is `2px var(--oxblood)` on `#4f1816` (≈1.4:1), so it is effectively invisible on the “Talk to JJ” button.** The JJ input has `outline:none`, and `.ask:focus-within` only changes the border alpha from 0.62 to 1, which is not a visible indicator. The skip link, wordmark, career tab, mic button and footer nav fall back to the UA ring (inconsistent but visible). | **material** | `JJCallout.module.css`: `.section :focus-visible { outline-color: var(--paper-light); }` and `.ask:focus-within { outline: 2px solid var(--paper-light); outline-offset: 3px; }`. Make the global rule in `contemporary-roman.module.css` cover the UA-ring elements, or remove the competing reset. |
| A11y-4 | Touch targets (enabled) | At 390, all ≥44 except the **wordmark link (142×22)**. At 768, the **footer nav, social and back-to-top links are 26 px tall**. Nav pill links are 44 tall ✓. The menu toggle is 44×44 ✓. | material (768) / minor | `ClosingFooter.module.css .link`: `min-height: 44px; display:inline-flex; align-items:center` below 1024. `FloatingNav .wordmark`: `min-height:44px` with inline-flex. |
| A11y-5 | Contrast over the actual background (WCAG, sampled behind each text box) | Pass: hero body 15.3, nav 16.1, career lede 10.9, narrative 12.7, products lede 14.8, beyond lede 7.7, JJ lead 12.5, JJ accent `#e0baa3` 7.9, JJ body 12.8, footer tagline 5.2, latin 8.2. **Fail:** inactive career company/period `rgb(107,102,94)` on sage `#e2dfd6` = **4.27** (15/14 px text). Featured tagline `rgb(75,59,51)` on terracotta at **390 = 2.67** (desktop 4.53 on `#d09e89`, which passes as large text). | material | `CareerJourney.module.css` inactive `.company/.period` → `#5c5750` (5.37:1 on `#e2dfd6`). `SelectedProducts.module.css` ≤767: keep `.featuredTagline` off the circle (`background: #d6a48e` band behind the copy) or use `--ink`. |
| A11y-6 | Labels | The Writing heading’s accessible name is “WritingPreview” because the badge is inside the `h3`. | minor | Move the badge out of the heading or give it a leading visually-hidden space/“(preview)”. |
| A11y-7 | Disabled actions | “View chapter”, “Open Feedback Intelligence”, “Read the latest edition”, “See all writing” and “Schedule a call” are `button[disabled]`. Writing rows have `aria-disabled` with tabIndex −1. None appears in the tab walk ✓. cursor default ✓, no hover motion ✓. Nothing has `href="#"` or an empty href ✓. | pass | — |
| A11y-8 | Career tabs | `role=tablist/tab/tabpanel`, roving tabIndex. ArrowDown moves selection and focus ET → INDMoney ✓. Home/End ✓. `aria-selected` and `aria-current` update ✓. Inactive panels are `inert` ✓. | pass | — |
| A11y-9 | Nav state | `aria-current="location"` on Products while products is in view ✓. The pill gets `data-scrolled` after scrolling ✓. The mobile menu opens (3 links, 182×44), Escape closes it, `aria-expanded` syncs ✓. | pass | — |
| A11y-10 | Reduced motion | All content visible with `reduce`. With motion on, every `[data-reveal]` ends “shown”/“idle” after scrolling ✓. | pass | — |

## Behaviour, regression and performance (I2–I4)

| Check | Result |
| --- | --- |
| Explore my work | Navigates to `#work`. Section top lands at y 96 (nav offset) ✓ |
| JJ question form | “What did you build at ET Money?” + Enter → `/chat?q=What%20did%20you%20build%20at%20ET%20Money%3F` ✓. Empty submit stays on `/roman-v2` ✓ |
| Music | “Play a track: Open It Up” drives the existing provider. There is exactly **one `<audio>`** before and after, and it plays `open-it-up.mp3` (paused=false) ✓ |
| Console | 0 errors and 0 page errors at 1672, 1440 and through all interactions ✓ |
| Images | Only the hero `<img>` is `loading=eager fetchpriority=high` ✓. All others are lazy ✓. **Every new-art `<img>/<source>` has stale `width/height` attributes** (hero 1105×748→737, hero mobile 850×748→850, career 812×357→457, frame 960×590→640, column 812×266→457, reading 584×419→389, music 516×210→290, JJ 1002×692→668, JJ mobile 560×682→700, footer 490×540→490). These layers are absolutely positioned, so measured **CLS = 0**, but the aspect boxes are wrong until load. Update the attrs, tagged stale. Career renders 5 `<img>` of the same art (one per chapter). Same URL, so it is cached once (minor). |
| LCP | 116 ms (local), element = hero `<img>` ✓ |
| Static checks | `tsc --noEmit` passes. `eslint` on `src/{app,components,lib}/roman-v2` and `scripts/roman-v2-qa.mjs` passes ✓ |

## Noise and intentional items (not to be fixed)

- Concept paper grain and halftone dot jitter. Diff energy across all backgrounds.
- Font rasterisation (Figtree vs the concept sans): ±1–3 px glyph-edge diffs on body copy, nav and buttons.
- Bands outside the section in references 01 (terracotta), 05 (old footer) and 06 (dark band), and the obsolete nav in 03.
- Interim crop-derived art, now replaced. Writing thumbnails and the WHOOP fragment are still interim.
- Inert or faded unavailable actions. WHOOP em dashes. Writing and reading preview fixtures with PREVIEW badges.
- Missing Feedback Intelligence screenshot (input required, §17).
