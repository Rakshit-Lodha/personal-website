# Roman v2 motion — lite draft QA (2026-10-17)

Drafts: `google/veo-3.1-lite` at 720p, two takes per clip, plus targeted retries. Review page: [drafts.html](drafts.html) (http://localhost:4321/drafts.html). Prompts: [PROMPTS.md](PROMPTS.md) (revision 3 for all remaining clips, revision 4 for the retried ones). Storyboard: [storyboard.html](storyboard.html).

**Spend this round: $6.96 of the $9 cap** (50 clips: 38 first-round takes $5.04, 10 retries $1.20, 2 experimental 8 s r21 takes $0.48). Real costs come from `clips/cost-log.jsonl`; the earlier hero desktop work ($0.86) is not included.

## Method

1. `node scripts/roman-v2-motion.mjs --tier draft --takes 2 --clips …` (retries: `--take-offset 2` → t3/t4).
2. Every take: `node scripts/roman-v2-motion-post.mjs --in clips/draft/<take>.mp4 --crop --out clips/draft/post/<take>.mp4`. This is the locked-background cinemagraph: a motion map (6 fps, max |frame − first|, ×4), then a mask (blur 3 → threshold 60 → blur 30 → threshold 12 → blur 16, each as its own sharp pass), then gbrp `maskedmerge` over the first-frame plate, then a crop with `cropToPage`. The mask and motion map are saved next to each output.
3. Contact sheets (12 frames of the post output) were viewed for every take, with zoomed crops of faces, hands and the knob face where needed.
4. Metrics: grey 320×180 mean absolute difference (0–255). "Seam raw" compares the first and last frames of the raw clip. "Seam post" compares the first and last frames of the locked, cropped output. "First/last vs keyframe" compares the clip ends with the provided frames. For reference, the approved hero loop4 t2 scores 1.43 / 1.56 and 2.61 / 3.10. Seams only matter for loops: intros, removals, book and knob clips have different first and last frames by design.
5. Reject rules: identity drift, extra or deformed fingers or hands, camera motion, text, background change, or breaking the hard constraints.

**Sanity check, task 1:** re-creating the approved hero D loop with the new script gives PSNR 44.2 dB average (min 36.7) against the hand-made `opt-D` loop, and they match visually. The new mask is cleaner: the background is fully locked, with no grey noise. The hand-made version applied repeated `blur()`/`threshold()` calls in one sharp chain, which sharp collapses into one step. The script also fixes a timing bug in the ad-hoc command: the still inputs now loop at the clip's frame rate (24 fps). At the default 25 fps, maskedmerge resampled the clip and dropped its last 0.16 s.

## Lessons from this round (added to `promptRules` in shots.json)

- **No hex codes in prompt text.** jj-idle-desktop-t2 drew "#59112" on screen. Revision 3 and 4 prompts now name colours in words.
- **Hand removals are the weak spot.** When a hand carries a piece out of frame, Veo tends to leave an empty sleeve or a drapery fold behind. It then pops the hand back in, adds a second hand, or puts the piece back. r21 failed 6 of 6 takes (including two experimental 8 s takes, which were not kept in shots.json).
- **Subtle idles can fall under the default mask threshold** (jj-idle-desktop-t1). Use `--threshold 24` for them.
- **A hand-drawn `--mask` can salvage a take** with a local defect outside the area that should move (products-reader t1: an eye-only mask hides a falling chip).
- **The knob** drifts and grows mid-twist, and its notch doubles in most takes. Veo is not a good fit for this shot.

## Recommended per shot

| Shot | Recommended | Status |
|---|---|---|
| hero mobile | intro t1 + loop t2 | ready for final |
| jj desktop | listen t1 + idle t3 | ready for final (listen hand passes the temple) |
| career removals | r43 t3 · r32 t1 · r21 t1 | r43/r32 usable; **r21 needs a new approach** |
| career idles | t2 for S4/S3/S2/S1 | ready for final |
| products-reader | t1 with eye-only mask | usable (salvaged); a clean retry is optional |
| beyond-book | A t4 + B t3 | usable (brief second-page flutter in B) |
| beyond-knob | A t1 · B t2 · C t2 (all weak) | **use the code-rotation fallback** |
| jj mobile | listen t2 + idle t2 | ready for final |

## Per take

| Take | Dur | Verdict | Why | Seam raw / post | First / last vs keyframe | Mask | Cost |
|---|---|---|---|---|---|---|---|
| hero-intro-mobile-t1 | 4 s | pass | Smooth single turn down to the screen; ends closest to TYPING. **Pick.** | 3.87 / 7.55 | 3.29 / 4.82 | 32.6% | $0.12 |
| hero-intro-mobile-t2 | 4 s | pass | Same motion; ends slightly further from TYPING. | 3.81 / 6.91 | 2.84 / 5.39 | 43.9% | $0.12 |
| hero-loop-mobile-t1 | 4 s | pass (weaker) | Typing steady; head drifts toward a slight chin lift mid-loop. | 1.45 / 2.94 | 3.16 / 3.94 | 30.0% | $0.12 |
| hero-loop-mobile-t2 | 4 s | pass | Head stays down, steady typing, clean seam. **Pick.** | 1.61 / 3.65 | 3.36 / 4.22 | 26.7% | $0.12 |
| jj-listen-desktop-t1 | 4 s | pass | Hand rises from below and settles at the ear; passes the temple on the way. Face stable. **Pick.** | 5.84 / 6.93 | 5.08 / 5.14 | 23.3% | $0.12 |
| jj-listen-desktop-t2 | 4 s | weak | Hand sweeps across the nose/mouth before reaching the ear. | 5.86 / 6.93 | 5.12 / 5.31 | 23.1% | $0.12 |
| jj-idle-desktop-t1 | 4 s | weak | Almost frozen (motion map below the default threshold; posted with --threshold 24). | 0.93 / 0.00 | 5.20 / 5.23 | 0.0% | $0.12 |
| jj-idle-desktop-t2 | 4 s | reject | Rendered the hex code "#59112" as on-screen text, plus extra halftone squares in the background. | 1.06 / 0.53 | 5.22 / 5.50 | 32.9% | $0.12 |
| jj-idle-desktop-t3 | 4 s | pass | Retry (rev 4, no hex code): gentle visible sway, hand stays at the ear, no text. **Pick.** | 1.12 / 0.28 | 5.08 / 5.33 | 12.8% | $0.12 |
| jj-idle-desktop-t4 | 4 s | pass (weaker) | Retry: clean but very little motion. | 1.04 / 0.15 | 5.05 / 5.38 | 6.8% | $0.12 |
| career-r43-t1 | 6 s | reject | Empty draped sleeve left where the hand was; a second left hand enters from the left while it is still there. | 4.66 / 7.95 | 2.52 / 3.36 | 25.6% | $0.18 |
| career-r43-t2 | 6 s | weak | Lift is clean; a drapery fold hangs where the hand was for ~2 s; the hand re-enters from the top-left. | 4.82 / 8.32 | 2.62 / 3.44 | 27.3% | $0.18 |
| career-r43-t3 | 6 s | pass with note | Retry (rev 4): cube lifts out rigidly, hand returns along a continuous path; a drapery fold is briefly revealed behind it. **Pick.** | 4.71 / 7.97 | 2.88 / 3.12 | 24.4% | $0.18 |
| career-r43-t4 | 6 s | weak | Retry: same drapery fold for longer; return path OK. | 5.00 / 9.03 | 2.76 / 4.24 | 37.2% | $0.18 |
| career-r32-t1 | 6 s | pass | Lifts the tall block straight out and returns cleanly (uses the left hand, not the right; reads naturally). **Pick.** | 2.60 / 4.48 | 2.65 / 3.22 | 36.0% | $0.18 |
| career-r32-t2 | 6 s | reject | A third hand grabs the block; the block is brought back down and pops away at the end. | 2.78 / 4.16 | 2.72 / 3.42 | 22.8% | $0.18 |
| career-r21-t1 | 6 s | weak | Clean lift-out, but the arm is left as an empty sleeve and the hand pops back in during the last 0.3 s. Best available. | 2.41 / 3.67 | 2.60 / 2.92 | 26.2% | $0.18 |
| career-r21-t2 | 6 s | reject | Block is lifted, then put back and vanishes at the end. | 2.43 / 4.37 | 2.73 / 3.00 | 41.6% | $0.18 |
| career-r21-t3 | 6 s | reject | Retry (rev 4): sleeve fills the left side; the block reappears before the end. | 2.72 / 4.55 | 2.67 / 3.33 | 32.7% | $0.18 |
| career-r21-t4 | 6 s | reject | Retry: an extra cracked arm enters from the top-left edge; the block comes back. | 2.95 / 4.26 | 2.71 / 3.51 | 29.3% | $0.18 |
| career-r21-t5 | 8 s | reject | Experimental 8 s retry: the block is put back down. | 2.86 / 5.25 | 2.72 / 3.31 | 43.4% | $0.24 |
| career-r21-t6 | 8 s | reject | Experimental 8 s retry: a separate small hand removes it; ghost hands at the left edge. | 2.30 / 3.52 | 2.73 / 2.99 | 36.6% | $0.24 |
| career-idle-s4-t1 | 4 s | pass | Fingers flex; blocks still. | 1.21 / 1.56 | 2.69 / 3.07 | 19.8% | $0.12 |
| career-idle-s4-t2 | 4 s | pass | Fingers flex; blocks still; lowest seam. **Pick.** | 1.10 / 0.69 | 2.54 / 2.90 | 11.4% | $0.12 |
| career-idle-s3-t1 | 4 s | pass | Very small motion. | 1.32 / 0.88 | 2.62 / 3.09 | 8.8% | $0.12 |
| career-idle-s3-t2 | 4 s | pass | Visible finger flex. **Pick.** | 1.48 / 1.21 | 2.59 / 3.31 | 12.9% | $0.12 |
| career-idle-s2-t1 | 4 s | pass | Very small motion. | 1.20 / 0.73 | 2.67 / 3.13 | 8.0% | $0.12 |
| career-idle-s2-t2 | 4 s | pass | Visible finger flex. **Pick.** | 1.17 / 0.90 | 2.63 / 3.02 | 12.5% | $0.12 |
| career-idle-s1-t1 | 4 s | pass | Fine; slightly higher seam. | 1.68 / 1.68 | 2.66 / 3.45 | 13.4% | $0.12 |
| career-idle-s1-t2 | 4 s | pass | Clean. **Pick.** | 1.04 / 0.62 | 2.50 / 2.86 | 12.4% | $0.12 |
| products-reader-loop-t1 | 6 s | pass (salvaged) | Two blinks, head still, but a stone chip breaks off the nose and falls past the lips at ~3 s (plus a chip through the curls). Re-posted with an eye-only mask (post/masks/products-reader-eye.png), which keeps the blinks and hides the chips. **Pick.** | 1.16 / 0.28 | 1.86 / 1.95 | 9.0% | $0.18 |
| products-reader-loop-t2 | 6 s | reject | Face splits horizontally and slides; debris crosses the screen. | 1.10 / 0.60 | 1.69 / 1.93 | 24.8% | $0.18 |
| beyond-book-A-t1 | 4 s | weak | Page lifts but flaps back and forth; new halftone squares appear in the empty top-left. | 4.55 / 4.86 | 3.03 / 3.56 | 33.3% | $0.12 |
| beyond-book-A-t2 | 4 s | pass (weaker) | One page lifts and curls; some wobble, ends further from the peak frame. | 4.46 / 5.21 | 3.05 / 5.62 | 24.5% | $0.12 |
| beyond-book-A-t3 | 4 s | weak | Retry (rev 4): page flaps back and forth. | 4.01 / 4.59 | 3.01 / 5.45 | 24.5% | $0.12 |
| beyond-book-A-t4 | 4 s | pass | Retry: single page lifts and curls, ends on the peak frame. **Pick.** | 4.45 / 4.77 | 3.01 / 3.24 | 17.4% | $0.12 |
| beyond-book-B-t1 | 4 s | reject | Several pages flip and a loose sheet flies out of the frame. | 4.74 / 5.53 | 3.11 / 3.79 | 32.2% | $0.12 |
| beyond-book-B-t2 | 4 s | reject | A ruled sheet slides over the Colosseum engraving, which fades and redraws. | 6.21 / 7.39 | 3.00 / 5.02 | 41.0% | $0.12 |
| beyond-book-B-t3 | 4 s | pass with note | Retry (rev 4): page lays down, sheets stay put; a second page lifts briefly near the end. **Pick.** | 4.62 / 5.46 | 3.02 / 3.49 | 27.1% | $0.12 |
| beyond-book-B-t4 | 4 s | weak | Retry: halftone squares beside the capital flicker in and out. | 4.99 / 6.28 | 3.07 / 3.94 | 50.0% | $0.12 |
| beyond-knob-A-t1 | 4 s | weak | Turns, but the notch doubles mid-twist and the knob face drifts/grows. Best A. | 1.53 / 1.83 | 1.73 / 2.22 | 47.1% | $0.12 |
| beyond-knob-A-t2 | 4 s | reject | A second hand enters from the right. | 4.35 / 4.35 | 1.73 / 5.22 | 51.6% | $0.12 |
| beyond-knob-B-t1 | 4 s | reject | Three notches visible at once; knob face jumps. | 4.39 / 5.63 | 1.76 / 5.08 | 48.1% | $0.12 |
| beyond-knob-B-t2 | 4 s | weak | Mostly one notch; knob face drifts. Best B. | 2.18 / 2.75 | 1.74 / 2.73 | 44.2% | $0.12 |
| beyond-knob-C-t1 | 4 s | reject | Notch fades out; ends off the n0 frame. | 4.25 / 5.55 | 1.74 / 4.90 | 40.9% | $0.12 |
| beyond-knob-C-t2 | 4 s | weak | One notch, clean seam; face wobbles. Best C. | 1.10 / 1.42 | 1.76 / 1.89 | 54.1% | $0.12 |
| jj-listen-mobile-t1 | 4 s | pass | Hand rises past the brow and settles at the ear; arm semi-transparent for ~0.2 s as it enters. | 7.84 / 11.60 | 3.24 / 3.62 | 42.4% | $0.12 |
| jj-listen-mobile-t2 | 4 s | pass | Same path; ends closest to the master. **Pick.** | 7.69 / 11.32 | 3.31 / 3.46 | 36.6% | $0.12 |
| jj-idle-mobile-t1 | 4 s | reject | Ends off the master: loop pop (seam 5.6). | 5.55 / 6.06 | 3.29 / 7.07 | 33.1% | $0.12 |
| jj-idle-mobile-t2 | 4 s | pass | Clean loop, hand stays at the ear. **Pick.** | 1.05 / 1.25 | 3.32 / 3.60 | 30.6% | $0.12 |

