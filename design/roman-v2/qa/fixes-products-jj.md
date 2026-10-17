# Roman v2 fix round J4: products + JJ

- **Base:** `roman-v2` @ `cd0c7c1`. **Files:** `SelectedProducts.{tsx,module.css}` and `JJCallout.{tsx,module.css}`.
- **Verify:** `tsc --noEmit` and `eslint src/components/roman-v2` are clean. Ran `npm run build` and `next start -p 3043`, then `scripts/roman-v2-qa.mjs --only products,jj`. Ran element probes and section captures at 1920, 1672, 1440, 1280, 1100, 1024, 768, 390 and 360. Ran a keyboard Tab walk through `#jj`.
- **Coordinates:** px in the 1672 capture with the section top at y=0, unless stated otherwise.

## Selected products

| ID | Status | Before → after |
| --- | --- | --- |
| P-1 | **fixed** | The screenshot now sits **above** the frame inside `.art`. It is clipped to the frame's dark opening, which I traced on the 960×640 export: flood fill of luminance < 50 from the centre, then a Moore boundary trace and Douglas–Peucker simplification at 2 px, giving 51 points. Opening bbox in the export: **x 188–826, y 112–498** (left 19.58 %, top 17.5 %, width 66.46 %, height 60.31 %). The 1536 master gives the same result to within 0.25 %. The review's 30.4 % / 19.1 % bbox ignored the part of the opening under the head. The polygon follows the head profile and the chin and neck shadow, so the face stays in front of the UI with a thin dark rim. The window renders at 822–1495 × 161–568, and the real AI Hiring Chat welcome screen is visible. The frame and the window now scale together on hover (`.art`). Before, they scaled separately around different origins. |
| P-2 | open (input) | The capture is still the light UI. It is real UI, so I kept it. A dark-mode `/chat` capture would match the concept better. Products mean diff rose 40.7 → 58.6 because of this light-vs-dark difference. |
| P-3 | fixed | `.title`: 8vw → 8.5vw (max 9rem), letter-spacing −0.02em → −0.008em. Section padding-top 103.7 → 109.7. “Selected” cap top 102 → ≈108 (ref 116). “products” baseline ≈325 (ref ≈330). The lede is ≈14 px below the ref because the face's `p` descender is deeper than the concept's, so the lede cannot sit any higher. The face is narrower than the concept's (X-6), so the residual width is accepted. |
| P-4 | fixed | `.featuredTitle`: 4.4vw → 4.9vw (≈82 px), letter-spacing −0.03em → 0. Copy padding-left 64 → 73.6, so the title starts at x 140 (ref 141). |
| P-5 | partly | Band y **414–690 → 401–665** (ref 401–665). I tightened the tagline and action margins and set min-height to 15.8vw. Band left stays on the shared container edge (x 67, ref 76), as the brief prefers. |
| P-6 | fixed | Gap 21.7 → 20. Cards y **710–937 → 685–913** (ref 684–911). Arrow box top 862 → **824** (ref 827). It stays 44 px tall for the touch target. Section height 971 → **943** (ref 941). |
| P-7 | blocked | Feedback Intelligence has no screenshot. The screenless card is unchanged. |
| P-8 | intentional | — |
| P-9 | **fixed** | The disc moved into the stage (`.sun`, in stage units) and is coloured `--products-circle: #ad6b50`, which is the sampled export ground. The frame image is masked to the same circle, using `mask-image` ellipse 65.2 % × 97.8 % at 68.8 % 66.1 %. That mask is intersected with a 2–6 % top fade and a 1–4 % right fade. The ground hangs below the band (7.7 %, translated and clipped), so the marble sits on the band edge as in 03. **No rectangle edge is visible** on the paper or on the band at any width I checked. Disc edge through (874,0) and (682,320), ref (884,2) and (686,320). Frame attrs 960×590 → **960×640**. |
| A11y-5 | fixed | At ≤1024 the disc is now clipped at the stage bottom, so the featured tagline sits on the plain band. Sampled behind the tagline at 390 and 360: `#d6a48e`. `#4b3b33` on it is **4.85:1** (was 2.67). |
| Responsive | ok | `scrollWidth === clientWidth` at every width. The stage is wider than the viewport by design at ≤1024, and the section clips it. At ≤1024 the header gets extra bottom padding (3vw, and 8px + 21vw at ≤767) so the rising disc stays clear of the lede. |

## Talk to JJ

| ID | Status | Before → after |
| --- | --- | --- |
| J-1 | fixed | Section height **738 → 714** (ref 713). Padding is 173.9 / 118.7. Title line-height 0.94 → 0.86, and body margin 33 → 13 (see J-2). |
| J-2 | fixed | Title 7.4vw → 7.7vw (max 8.4rem), letter-spacing −0.025em → −0.01em. Copy max-width 46 → 54rem, so the heading stays on two lines. Ink x 94–≈820 (ref 92–850). The narrower face is accepted (X-6). |
| J-3 | fixed | Talk to JJ is at **94–304 × 525–595** (ref 95–305 × 525–593). The input is at 319–654 × 525–595 (ref 320–654). The body box top is 409, and the glyphs line up with the ref at 419. |
| J-4 | fixed | Orb centre (1481,466) → **(1481,430)**, diameter 161 (ref r≈80). |
| J-5 | **fixed** | `--jj-bg` `#4f1816` → **`#591311`**, which is the sampled ground of both listener exports, so the art box has no edge. The art is now sized from the section height (top −22.9 %, height 149.9 %, `aspect-ratio` 1002/668), with the head centre at 67 % of the width. Result: hair top ≈45, head ≈ x 905–1330 (ref 880–1360), and the bust is cut by the section bottom as in 05. The orb sits at 75.3 % / 55.5 % of the art. From 1024 to 1179 the art anchors at 64 % so the orb stays inside the viewport. On tablet the art is pulled up by −10 % over its empty top ground, with the orb at 82 % / 40 %. On mobile the orb moves to the empty top-right of the portrait art (right 3 %, top 22 %, width 20 %). I also fixed a regression from this change: the tablet `.art` now resets `aspect-ratio`, so the portrait mobile art is not cut off. Attrs 1002×692 → **1002×668**, mobile 560×682 → **560×700**. `sizes` → 96vw. |
| A11y-3 | fixed | In `.section`, `--focus-ring: var(--paper-light)`. Talk to JJ and the mic button show a 2 px `#f7f2e9` ring. `.ask:has(.input:focus-visible)` shows a 2 px paper-light outline (offset 3) around the field. All three were checked in a real Tab walk. |
| X-4 | done | I removed the local `max-width: 1680px` from both sections, and JJ's duplicate `padding-inline`, so the shared container now does the job. |

## Remaining deviations

- **Concept circle behind the JJ head** (`#491614`) is not reproduced. The art ground is opaque, so a CSS circle cannot show behind it. Matching the background was the fix the review asked for. The section is slightly redder than 05 (`#591311` vs ≈`#4e1919`).
- **JJ art is upscaled ≈1.6×** at 1672 (1002 px export shown ≈1600 px wide), and more at DPR 2. It is acceptable at DPR 1 under the grain, but soft. **Requested shared change:** export `jj-listener` at 1600 and 2000 w (the 1536 master would need upscaling, so 1536 w is the realistic maximum). Then add it to the `srcSet` here.
- The products lede is ≈14 px below the ref because of the descender, and the band/card left edge is 9 px left of the ref (shared container). Both are minor and intentional.
- P-2: a dark-mode capture of AI Hiring Chat is needed (input). P-7: blocked on a Feedback Intelligence screenshot.
- At 1024 the JJ face comes within ≈20 px of the end of “back.” but does not overlap it.
