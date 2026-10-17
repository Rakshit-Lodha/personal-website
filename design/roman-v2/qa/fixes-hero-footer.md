# Roman v2 fix round J4: hero, floating nav and footer

- **Base:** `roman-v2` @ `cd0c7c1`. **Files:** `FloatingNav.module.css`, `Hero.tsx`, `Hero.module.css`, `ClosingFooter.tsx`, `ClosingFooter.module.css`. `FloatingNav.tsx` is unchanged.
- **Verify:** `tsc --noEmit` and `eslint src/components/roman-v2` are clean. Production build on `:3041`. `scripts/roman-v2-qa.mjs --only hero,footer`.
- **Mean abs diff:** hero 43 → **33.4**. Footer 28 → **24.1**. Footer height 864 → **845** (reference 845). Hero height 845 (unchanged).
- **Responsive (1920, 1440, 1280, 1024, 900, 899, 768, 390, 360):** `scrollWidth === clientWidth` at every width. Hero copy, CTAs and art do not overlap. The nav pill and wordmark do not overlap. There are no enabled targets under 44 px below 1024.

## How the new art is placed without a visible box

The regenerated exports ship on an **opaque paper ground**. Only a soft 1–5 % alpha ramp sits at the edges. The grounds are: hero `#f4e8da`, mobile hero `#f3eadd` and hand `#e2d4c6`. The hand ground is darker than both the footer paper `#f0e8dd` and the circle `#e6dacd`, so no plain opacity, mask or colour change can hide the box.

The fix stays in owned files and needs no artwork change:

- An inline SVG `feColorMatrix` filter in each component applies a per-channel gain. The hero uses `1.02 / 1.03 / 1.055` and the hand uses `1.08 / 1.11 / 1.13`. The gain lifts the 0.5th-percentile ground just above both the section paper and the circle.
- The art then uses `mix-blend-mode: darken`, so the ground drops out wherever it is lighter than what is behind it.
- The figure, laptop, halftone and hand are darker than the backdrop, so they stay.

In the captures the paper and circle sample at **exactly** their CSS colours on every side of the art (`#f4ebdf` / `#ecdecf` in the hero, `#f0e8dd` / `#e6dacd` in the footer). The circle now shows behind the head.

The export's outer 1–2 % has a dark, low-alpha fringe that drew a faint line at x≈258. The hero mask now starts transparent at 1.5 % on the left and top and 1 % on the right, and the mobile mask does the same on three sides. The hand's fringe measured ≤1 unit, so it needs no mask.

Side effect: where the toga or hand highlights are lighter than the backdrop, the backdrop shows through. This is a 2–3 unit difference between the circle and the paper, which is not visible.

## Hero and nav

| ID | Status | Before → after (1665 capture) |
| --- | --- | --- |
| H-1 headline collision | fixed | The j-dot no longer rises above the “Product” baseline. The gap is ≈8 px, as in the reference. Size `10.9u → 9.3u`, line-height `0.66 → 0.76`, letter-spacing `−0.035em → 0`. “Product” baseline 333 → **≈336** (ref 339). The ascender sits ≈10 px above the reference, and “Product” is ≈0.9× the reference width. Both are the accepted Instrument Serif face difference (X-6). The 9.6u suggested in the review still left the glyph 10 % taller than the reference. |
| H-2 body | fixed | `1.8u → 1.85u`. Box 107–556 × 505–625. Lines match the reference to ±2 px (overlay). |
| H-3 CTAs | kept | Explore 107–342 × **658–715** (ref 109–344 × 658–715). Talk to JJ 366–544 (ref 368–541). Copy `bottom 7.8u`, actions `margin-top 2.4u → 2u`. |
| H-4 wordmark / pill | kept | Wordmark ink unchanged. The pill is still 919–1583 × 22–86. |
| H-5 art placement + circle | fixed | The 1105×737 export is drawn at **1.2×** (`width 79.64u`, `left 14.51u`, `bottom −6.37u`). Measured landmarks: hair top **115** (ref 115), laptop left **615** (ref 615), brooch **(1304, 403)** (ref 1300, 410), laptop base right 1082 (ref 1065), hair x 1024–1280 (ref 1005–1290). The new master's head is proportionally smaller, so no single scale matches the head, the body and the chair: 1.2× fits the body and focal points, and the chair ends at ≈1550 (ref 1590). The lap runs ≈106 px past the hero bottom, as in the reference. The circle is now left/bottom-anchored with the art, centre **(1247, 450)**, r 507, and is visible behind the head. The art box and ghost tiles are gone (see above). |
| H-6 image dims | fixed | Desktop `1105×737`. Mobile `<source>` `850×850`. `sizes` → `min(79.7vw, 1434px)`. |
| H-7 ≥1800 alignment | fixed | `--edge: max(0px, (100% − var(--container-max)) / 2)` offsets the copy, art and circle in the hero, and the wordmark and pill in the nav. At 1920: hero copy **235**, wordmark **237**, pill right edge **1712**. The container sections start at 192 and the footer headline at 215. The hero keeps its +20 px reference offset over the footer. The same scale was 125 before. |
| Responsive: mobile hero (square 850 master) | fixed | The art is bottom-right, `min(100%, 640px)` square. The CSS circle (replacing the old `.art::before` tuned to 850×748) is placed from the art box: centre (66 %, 41 %), r 49 %. The same ground filter and darken blend apply, with no box. The mobile title line-height is `0.72 → 0.8`, because the j-dot touched “Product” at 768/390. The copy gutter is `max(16px, 5vw) → var(--gutter)`, to match the other sections. |
| Responsive: 900–1199 | fixed (new) | The fixed-width pill (665 px) covered the wordmark at 900. It now compacts to 529 px between 900 and 1199. Below 1400 the CTAs hit their 44 px / 16 px floors and the halftone touched “Talk to JJ” at 900–1024. `--shift: max(0px, (1400px − 100vw) × 0.2)` nudges the art and circle right (+100 px at 900, 0 at ≥1400). |
| A11y-4 wordmark | fixed | Nav wordmark link 142×22 → **142×44** (`inline-flex`, `min-height: 44px`). |

## Footer

| ID | Status | Before → after (1672 capture, section top = 0) |
| --- | --- | --- |
| F-1 headline | fixed | Letter-spacing `−0.025em → −0.012em`, line-height `0.94 → 0.9`, top padding +10 px. Line 2 ink matches the reference (overlay). Line 1 ascender is ≈8 px high, an accepted face difference. |
| F-2 CTAs | fixed | Conversation `2.2vw → 2.4vw` (40 px), letter-spacing 0. Margin `3.2vw → 2.3vw`. CTA gap `2.9vw → 4.5vw`, because the narrower face left the Schedule button 27 px left. Schedule a call **474–730 × 437–501** (ref 474–729 × 438–501). Underline at y≈490 (ref 490). |
| F-3 rule / grid | fixed | Rule **589** (ref 590), bottom rule **787** (ref 788). Separators are unchanged at 542 / 818 / 1094 / 1354. The review's `grid margin −14` was not applied: the CTA margin change alone recovers the 14 px, and applying both put the rule at 575. Padding `34/36 → 38/36` with the new list metrics. |
| F-4 nav list | fixed | The nav `ul` was not a flex container, so `gap` did nothing, and the 1.55 inherited line-height gave a 35.5 px pitch. `.list` is now a column flex. `.grid .link` line-height is 1.2 and it is `inline-flex`. Pitch **32** (ref 32). First item centre ≈641 (ref 642). The lists are top-aligned. |
| F-5 socials | intentional | The order is data-driven (`content.ts`) and left unchanged as briefed. Top-aligned with pitch 32. |
| F-6 timezone / back to top | fixed | Timezone `align-items: flex-start` with left padding `clamp(24px, 3.4vw, 56px)`. “India · IST” x **1151** (ref 1151). Both cells take a 16 px top padding so their centre moves 689 → ≈697 (ref 697). Back to top ends at 1603 (ref 1600). That is the container edge, so it is left. |
| F-7 motto | fixed | Root bottom padding `28 → 15`. Section height **845** (ref 845). The motto baseline matches within ±3. |
| F-8 cursor | fixed | Inline `aria-hidden` SVG, `#7d211d` with a drop-shadow glow. Placed in the art box so it tracks the hand: tip at **(1177, 476)** (ref ≈1177, 476). Hidden below 1024. |
| F-9 hand art | fixed | The 490×490 export is drawn at **1.242×** (`36.4fu`, `fu = min(1vw, 16.8px)`), right-anchored, `top 4.37fu`. **Fingertip at (1200, 470)** (ref 1200, 470). The drape's cut edge sits on the viewport edge. No art box shows (see above). The circle is now right-anchored with the same `fu` scale. It is unchanged up to 1680: centre (1295, 345), r 320. Above 1680 the hand and circle stop growing together. Attrs → `490×490`. |
| A11y-4 footer links | fixed | Below 1024, footer nav, social and back-to-top links are **≥44×44** (`min-height`/`min-width` 44, `inline-flex`, centred text). At 768 the nav and social rows now line up. |
| X-4 containers | fixed | Removed the local `max-width: 1680px` and `padding-inline` from `.inner`. The shared `.container` (`--container-max` 1680, `--gutter`) gives the same edges: rule x 67 at 1672 and 192 at 1920. |

## Remaining and requests

- **Shared/asset request:** key the hero, hero-mobile and footer-hand master grounds to alpha in `scripts/prepare-roman-v2-assets.mjs`. The filter-plus-darken approach works, but it depends on the ground staying lighter than the section colours after the gain. A real alpha cut-out would let these filters go.
- **Shared/asset request:** add a ≥1400 w hero export. The 1105 w file is now drawn at 1326 px at 1665 and 1434 px at ≥1800, which is soft on DPR 2. The master is 1536 w.
- **Face difference (accepted, X-6):** the hero and footer headlines are ≈0.9× the reference width at matched baselines.
- Desktop (≥1024) footer links remain 26 px tall, as in the reference. That is pointer UI. A11y-4 only requires 44 px below 1024.
- At 768 the 45 %-opacity hand still sits behind “use.” in the headline. This is the existing tablet treatment and was not flagged.
