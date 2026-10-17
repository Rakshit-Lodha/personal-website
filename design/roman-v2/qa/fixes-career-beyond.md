# J4 fixes: career + beyond

Base `cd0c7c1`. Verified on a production build (`next start -p 3042`) with `scripts/roman-v2-qa.mjs --only career,beyond` at 1672×941. Responsive checks used a Playwright measure script at 1280, 1024, 768, 390 and 360. Coordinates are px in the 1672 capture with the section top at y=0.

Mean abs diff: career 38.7 → **34.3** (>32 px share 32.4 % → 26.8 %). Beyond 41.9 → **37.4** (38.0 % → 33.0 %). Most of the remaining diff is artwork and grain.

## Work, over time

| ID | Status | Before → after |
| --- | --- | --- |
| C-1 | fixed | Section 1096 → **940** (ref 933 rhythm / 941 frame). Card 338–1046 (708) → **327–890 (563)**, ref 327–889. |
| C-2 | fixed | Panels still share one grid cell, so tab switches cause no layout shift. Natural panel heights are now Paytm 563, ET 563, INDmoney 559 and LearnApp 529, so no chapter is taller than the reference card. The title uses `text-wrap: balance` at 39cqi (≈542 px). Every title fits on 2 lines and the ET title breaks “Scaled AI + / financial products” as in the ref. The ET labels sit on one line (`max-width: 16em`). Only INDmoney’s long label wraps, and that panel’s shorter copy absorbs it. |
| C-3 | fixed | Ink positions: title 374–520 → 372–528. Role 538–567 → 543–569. Narrative 593/627/661 → 598/632/667. Rule 711 → 709. Values 740–815 → 741–812. Labels 831–852 → 828–849. Card bottom 889 → 890. |
| C-4 | fixed | Role 26.9 → 30 px (2.16cqi). Narrative 23.4 → 26.5 px with 34 px pitch (1.9cqi / 1.28) and max-width 490. Narrative line 1 is “Support automation, lending and wealth”, as in the ref. Line 2 also fits “and”. At 481 px it would match the ref wrap exactly, but INDmoney then wraps to 3 lines and the card grows by 30 px, so height took priority. |
| C-5 | fixed (layout follows copy) | Values 75 px cap. Labels 22.6 → 24 px, one line. Columns 345 / 744 / 1073 with separators 706 / 1035 (ref 343 / 660 / 1038 and 622 / 996). Our label copy (“fewer monthly support tickets”, “AUM on ET Money Earn”) is longer than the concept’s, so the columns are content-sized rather than fixed. |
| C-6 | fixed | Title 152 → 162 px (`clamp(3rem, 9.7vw, 10.125rem)`), letter-spacing −0.035 → −0.005em. Ink width 755 → **877** (ref 948, face difference X-6). Headline and lede left edge 72 → **89/90** (header `padding-left: clamp(0, 1.35vw, 24px)`, desktop only). Lede ink 260–288 → 252–281 (ref 251–287). |
| C-7 | fixed | Dots centred 76.5 at y 369/489/608/727 (ref 75 at 365/484/607/731). Periods are uppercase and render without spaces, e.g. “2026—NOW”. The content string is untouched: `tightPeriod()` formats it for display only. |
| C-9 | fixed | “View chapter” 1385–1605 × 742–802 (ref 1386–1605 × 744–804). It stays inert and faded. |
| C-10 | fixed | The card is 281–1672 at top 327. In the ref the card runs past the content edge to the viewport, so `.card` now bleeds into the gutter (`margin-right: -var(--gutter)`) and the panel’s right padding equals the gutter. The content right edge stays at 1605. |
| C-11 | fixed (stale art) | Width/height attributes 812×357 → **812×457**. The art box is **860–1672**, which is exactly the reference bounds, because the card now reaches 1672. The art is shifted up 4.3cqi and clipped at the card top (`clip-path`), so the block baseline sits at ≈y 672 (ref ≈670) above the rule. A CSS mask fades the left 30 % (removing the ghost tiles) and the bottom 15 %. The rectangular box outside the card is gone because the art no longer extends past the card. |
| C-12 / X-5 | fixed | Terracotta glow moved to `.backdrop::after`. It was painted under the sage circle and so was invisible. It now shows at the bottom right below the card. |
| A11y-5 | fixed | Inactive company/period `#6b665e` → **`#5c5750`** (5.37:1 on `#e2dfd6`). Applies to the desktop tabs and the mobile accordion. |
| X-4 | done | The local `max-width: 1680px` on `.inner` was removed. The shared `.container` now does the job. |
| JJ `onSelect` effect | kept | Untouched. |

Remaining: the new hands master has its figures in the right ≈70 % of the frame, so the left hand starts at x≈1225 rather than 870. Scaling it up would clip the fingertips or upscale past the 812 export. The 1280 and 1024 footers still wrap “View chapter” onto a second row (container < 1150 px), as before.

## Beyond work

| ID | Status | Before → after |
| --- | --- | --- |
| B-1 | fixed | `grid-template-columns: 1024fr 60fr 490fr`, `gap: 14px 13px`, header min-height 195. Reading 36–1133 × 267–692, writing 1146–1636, music 36–1060 × 706–916, WHOOP 1073–1636 × 706–916. All within 1 px of the ref. |
| B-2 | fixed | Title letter-spacing −0.02 → −0.01em, word-spacing 0.08em. The remaining width difference is the face (X-6). |
| B-3 | fixed | Title margin 28 → 20 and line-height 0.96 → 0.9 (box 359–514 → 346–491). Dek margin 22 → 16 (box 536 → 507). CTA padding-inline 29 → 40: **75–381 × 567–629** (ref 76–382 × 567–629). At ≤767 the padding is 24 px so the label stays on one line at 360. |
| B-4 | fixed | Card padding-top 34 → 32 and lede margin 14 → 9 (lede 339 → 327 box). Rows margin 20 → 14 and row min-height 84 → 86 (pitch 87, ref 87). See-all 637–682 → 627–672 (ref 628–672). |
| B-5 | fixed | Columns `125px 136px max-content` from x 1109, so labels sit at **1109 / 1267 / 1403** (ref 1109 / 1265 / 1405) with separators at **1234 / 1370** (ref 1234 / 1370). Metrics margin-top 38 → 24, so the label box is at 781–807 (card-relative baseline ≈ 95 → ≈ 82). |
| B-6 | fixed | A `.whoopCard::before` sage disc (r 90, centred ≈(1590,740)) sits behind the fragment. It is hidden at ≤767. |
| B-8 | fixed | Mobile: the black panel and player chrome are hidden and the music art fills the card width (516×290 aspect). There is no empty slab at 390 or 360. |
| B-9 / A11y-6 | fixed | The Writing PREVIEW badge moved out of the `h3` into a flex row (`.eyebrowRow`). The heading’s accessible name is now “Writing”. The badge stays as adjacent text, so assistive tech still announces “Preview”. |
| B-10 | fixed (stale art) | Attributes: column 812×266 → **812×457**, reading 584×419 → **584×389**, music 516×210 → **516×290** (mobile `sizes` now 100vw). The column art sits at top 0 with a left 34 % mask fade, so the hard edge at x≈890 against the paper circle is gone. The reading art fades over its left 30 %, removing the ghost tiles at 560–760. The music art stays bottom-aligned in the 210 px card, which crops the master’s top 80 px. The knob lands at ≈(720,771) (ref ≈(725,790)). |
| B-11 | fixed | At ≤767 the column art is 46vw (was 72vw) at the top right and no longer sits behind the lede. |
| Mobile WHOOP overlap | fixed | The fragment is 56 px at ≤767 and clears the “Strain” dash. |

Remaining: the WHOOP value placeholder bars in the ref versus our em dashes are intentional (no reading). Beyond keeps its own inner container (`1600 + 2·pad`, cards at 36 px), because the reference clearly puts its cards outside the shared gutter.

## Responsive and checks

- No horizontal overflow at 1672, 1280, 1024, 768, 390 or 360 (`scrollWidth === clientWidth`). No console errors.
- 1280 and 1024: the career card bleeds to the viewport edge. The narrative is capped at `max(35.2cqi, 24rem)` and the copy at `max(39cqi, 26rem)`, so it no longer wraps to 4 lines at 1024. Beyond stacks at ≤1100 as before.
- 768/390/360: the career accordion is unchanged apart from the new art aspect and colours. Beyond music, WHOOP and header art are fixed as above.
- `tsc --noEmit` and `eslint src/components/roman-v2` are clean.

## Shared/asset requests

- None required. Optional: fading the masters’ edges in `scripts/prepare-roman-v2-assets.mjs` (career left/bottom, column left, reading left) would let the CSS masks in `CareerJourney.module.css` / `BeyondWork.module.css` be removed.
