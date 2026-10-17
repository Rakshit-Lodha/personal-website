# Roman V2 Asset QA

This file records the acceptance gate for the generated master artwork. A master is accepted only after visual inspection against its exact prompt in [`CODEX_PROMPTS.md`](./CODEX_PROMPTS.md).

| # | Asset | Status | QA notes |
|---:|---|---|---|
| 1 | `hero-figure.png` | Accepted | 3:2; recognizable identity; head, torso, hands, and laptop face left; copy-safe left field; no text or UI. |
| 2 | `hero-figure-mobile.png` | Accepted after revision | Square; first pass rejected because laptop was clipped; corrected pass contains the full laptop with margin and preserves leftward orientation. |
| 3 | `career-hands.png` | Accepted | 16:9; hands and geometric blocks are right-weighted; left copy field is clear; no face, text, chart, or UI. |
| 4 | `projects-frame.png` | Accepted | 3:2; weathered marble frame, right-facing profile, clean dark insertion opening, terracotta ground, no text or UI. |
| 5 | `projects-head.png` | Accepted | 2:3; clean right-facing marble portrait, terracotta ground, no frame, text, or UI. |
| 6 | `beyond-reading.png` | Accepted after revision | 3:2; worker removed an unrequested olive branch; final has open book, Roman paper collage, empty left copy field, and no readable writing. |
| 7 | `beyond-music.png` | Accepted | 16:9; single Roman hand and black knurled knob, oxblood disc, no waveform, text, UI, or extra object. |
| 8 | `beyond-column.png` | Accepted | 16:9; column and olive branch remain on the right with a clear left field and restrained square-dot dissolve. |
| 9 | `jj-listener.png` | Accepted after revision | 3:2; first pass invaded the orb-safe area; corrected subject and halftone stay inside the middle band with both reserved side zones clear. |
| 10 | `jj-listener-mobile.png` | Accepted | 4:5; centered left-facing listening pose with toga, brooch, and lower-left halftone; no orb, text, or UI. |
| 11 | `footer-hand.png` | Accepted | Square; hand reaches from upper right toward lower left with fingertip near the intended placement and a clear left edge. |

## Final gate

After all 11 masters are accepted, run `node scripts/prepare-roman-v2-assets.mjs`, inspect the prepared runtime crops, compare the implemented page against the final reference image, and complete a pixel-by-pixel design review before marking the Roman V2 build finished.
