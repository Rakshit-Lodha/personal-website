# Roman v2 motion: QA report

Date: 2026-10-18. Branch `roman-v2`, uncommitted working tree.

**Setup**
- Production numbers come from a scratch copy of the working tree, built with `next build` and served by `next start` on :3080.
- The pre-motion baseline is commit `932340f`, built the same way and served on :3081.
- Behaviour checks ran on the dev server (:3000) and were re-run on the final production build.
- Browser: headless Chrome for Testing 1217 with `--autoplay-policy=no-user-gesture-required`.
- Three test configurations: desktop 1440×900, Android UA 390×844, and iPhone UA 390×844.

The tree changed while QA was running, and the final numbers are from the last rebuild, which includes all of these changes:
- Beyond Work hover/in-view gate (`CardActivity`).
- Hero still swapped to the typing pose, with the hero intro clip removed (loop only).
- Knob rebuild started by another agent.

## Summary

| # | Check | Result |
|---|---|---|
| 1 | Loading / perf | **Pass, with one risk.** No clip loads before window load and the end of IntroReveal. CLS during the intro is 0. Only clips near the viewport load. Risk: on desktop the hero video can become the LCP entry (see issue 1). |
| 2 | Behaviour | **Pass.** One career fix was made. The knob check is **pending rebuild**. |
| 3 | Visual alignment | **Pass**, after the mobile book fix (applied by the coordinator). No ground box or halo. The knob check is **pending rebuild**. |
| 4 | Reduced motion / Save-Data / slow connection | **Pass** |
| 5 | Pixel QA, tsc, eslint | tsc and eslint are clean. Pixel diffs moved, but none of the change comes from the motion layer, which renders nothing in this capture (see 5). |

## 1. Loading and performance (production build, :3080)

**When the first clip is requested.** It always comes after `load` and after IntroReveal ends. No `.webm` or `.mp4` is requested before that.

| Config | `load` | IntroReveal end | First clip request |
|---|---|---|---|
| Desktop | 805 ms | 6418 ms | 6415 ms |
| Android | 487 ms | 4711 ms | 4702 ms |
| iPhone | 328 ms | 4483 ms | 4483 ms |

**Source selection.** Every configuration picked the WebM source, including Chrome with an iPhone UA, because the engine check uses `userAgentData`.

**LCP, unthrottled:**
- Desktop: the hero image (`hero-figure-typing-1536.avif`) at 764 ms in one run (`mq/perf-final.txt`).
- Desktop repeat runs (`mq/lcp.mjs`), 3 of 3: the image was never reported, because the hero art fades in from opacity 0. The last LCP entry was the hero loop `<video>` at about 5.7 s (size 557,055). See issue 1.
- Phones: an IntroReveal text span at 80–264 ms. This is the same kind of entry as the pre-motion build, where the nav wordmark was the LCP.

**CLS:**
- 0 across the whole intro in all three configs.
- After a full scroll it is 0.011 on desktop and 0.018 on phones. All of it comes from the FloatingNav pill growing taller as you scroll (`FloatingNav.module.css`, user WIP). None of it is from motion.

**Clips fetched while scrolling.** Clips load section by section, only when in or near view:
- Desktop, final build: hero-loop, then products, then jj-listen, then jj-idle.
- The desktop career card does not fetch anything until the visitor picks a chapter (see issue 3).
- The desktop book clip loads only on hover.
- Phones: hero-loop, career-idle-s4, products, book, `beyond-knob-hand`, jj-listen, jj-idle.

**Bytes for a full scroll:**

| | Pre-motion (`932340f`) | Motion, total | Of which video |
|---|---|---|---|
| Desktop | 1.06 MB | 3.46 MB | 1.64 MB |
| Phone | 1.13 MB | 3.83 MB | 1.97 MB |

- Phones load the 1080×720 desktop hero loop (406 KB), because the `-mobile` hero clips are only used at 701–899 px. This is by design: phones show the desktop art.
- An earlier build that still had the hero intro clip was 4.35 MB on desktop and 4.17 MB on phones.

**JS:**
- Script transfer for /roman-v2 is 497 KB now and was 305 KB at `932340f`.
- Almost none of that is motion. The motion player plus the manifest is about 3.4 KB gzipped: about 1.0 KB for the manifest and about 2.4 KB for LoopVideo.
- The rest comes from the 29 later commits and the user's WIP (music, JJ, homepage). Next 16 no longer prints route sizes.

**Throttled mobile run** (CPU 4×, Slow 4G through CDP):
- Under this profile Chromium reports `effectiveType` as `3g`, so **no video loads at all**, which is correct.
- Phone: LCP 5.9 s (`hero-figure-typing-1536.avif`), TBT 496 ms, CLS 0.
- Desktop: LCP 6.0 s, TBT 227 ms, CLS 0.
- Pre-motion phone run: LCP 3.25 s (`hero-figure-mobile-*`), TBT 79 ms.
- The LCP regression is not caused by motion. It comes from the hero art change (user WIP): phones now get the 1536 w hero image at DPR 3, and IntroReveal fetches the same art again through `/_next/image` (113 KB). The higher TBT comes from the extra 190 KB of JS that isn't motion.

## 2. Behaviour

**Hero**: pass, on dev and on the final production build.
- The loop starts when IntroReveal ends and plays only then.
- After a reload it goes straight to the loop.
- It pauses when scrolled offscreen and resumes when scrolled back.
- It pauses when the tab is hidden and resumes when it is visible again.
- An earlier build with the intro clip also passed: the intro played once, then the loop took over with a hard cut, and the sessionStorage key meant the intro did not replay on reload.
- Script: `mq/b-hero.mjs`.

**Career, desktop**: pass after the fix. Script: `mq/b-career.mjs`.

| Move | Clips played |
|---|---|
| Paytm Money → ET Money | r43 (1×), then idle-s3 |
| ET Money → INDMoney | r32, then idle-s2 |
| INDMoney → LearnApp | crossfade to idle-s1 (there is no r21) |
| LearnApp → INDMoney | crossfade to idle-s2 |
| INDMoney → ET Money | r32-rev, then idle-s3 |
| ET Money → Paytm Money | r43-rev, then idle-s4 |
| Two-step jump, Paytm Money → INDMoney | r43 at 2×, r32 at 2×, then idle-s2 (the reverse direction also passes) |
| Three-step jump | crossfade straight to the target idle |
| Rapid keys ↓↓↓↑↑ | ends on ET Money: r43 finishes at 2×, then idle-s3 |

- The card pauses when offscreen.
- Before the fix, the second hop of a 2-step jump played at 1×. Fix 2 below covers this.
- The page opens on the Paytm Money S4 still, and the S4 idle loop does not play until a chapter changes (issue 3).

**Career, mobile accordion** (Android and iPhone): pass.
- Each open item's idle loop plays only while that item is in view. The others pause.

**Products**: pass.
- The reader loop plays in view.
- The real screenshot sits above the video in the frame opening, both in DOM order and visually (`qa/align-products-*.png`).

**Book** (new behaviour): pass.
- Desktop: it stays on the still until hover. On hover it loops continuously, wrapping 7.0 s → 2.0 s with no hold. On leave it pauses on the current frame, and it resumes on hover.
- Phones (Android and iPhone UA): it plays when the card is in view.
- Script: `mq/b-book.mjs`.

**Knob**: **pending rebuild**. Another agent is rebuilding it with a hand video, code rotation and a fingertip matte. Earlier in this pass I found and fixed the mobile rotation-origin bug (fix 1). The rebuilt knob still needs its own check.

**JJ**: pass.
- At 32% visible nothing plays.
- In full view, listen plays once and then idle loops (desktop and mobile).
- The orb stays `data-state="idle"`. The orb is a sibling above the video layer and is unaffected.

**Footer**: pass.
- `data-reach="out"` while the footer is below the fold, `"in"` at ≥35% visible.
- Final state: opacity 1 on desktop and 0.45 on phones (the phone CSS sets 0.45), transform `none`.

**Console errors**: none in any run.

## 3. Visual alignment

Each check pauses the clip mid-playback and compares that frame with the still (`qa/align-<clip>-<width>.png`: video | still | diff ×4). The edge band is the outer 6% of the box. It is where a ground box or halo would show up.

| Clip | 1440 mean / edge | 390 mean / edge |
|---|---|---|
| hero-loop | 5.26 / 0.53 | 8.78 / 3.14 |
| career idle-s4 (desktop card / mobile accordion) | 6.79 / 0.95 | 7.43 / 1.23 |
| products-reader-loop | 2.37 / 0.10 | 9.23 / 4.41 |
| beyond-book-loop | 8.08 / 4.95 | 11.29 / 6.91 (**56.24 / 34.45 before fix 3**) |
| jj idle | 1.97 / 0.01 | 5.93 / 0.75 |

- The layers line up, and there is no ground box or halo against the section background in any clip.
- The phone diffs are higher because the browser resamples a 1080 px source down to about 437 px. A 4× zoom of the frame corner shows the edges agree within about 1 px (`qa/zoom-products-390.png`).
- The knob check (no doubled notch) is **pending rebuild**.

## 4. Reduced motion, Save-Data and slow connection

Tested on the production build, all three configs, with a full scroll. Script: `mq/b-nomotion.mjs`.

| Condition | Video elements | Video requests | Knob layers |
|---|---|---|---|
| Reduced motion | 0 | 0 | 0 |
| Save-Data | 0 | 0 | 0 |
| Slow 3G (`effectiveType` 3g) | 0 | 0 | 0 |

- The desktop career card swaps in the per-stage stills: `career-s3`, `-s2`, `-s1`, then `career-hands`.
- Footer hand:
  - Reduced motion: it starts in its final position and has no `data-reach` attribute.
  - Save-Data and slow 3G: it plays its CSS slide once and ends in its final position. This costs no bytes.
- The only media request in these runs is the music player's `open-it-up.mp3`. That is not part of the motion layer.

## 5. Pixel QA, tsc and eslint

I ran `scripts/roman-v2-qa.mjs --base http://localhost:3080`, which captures with reduced motion. It rewrote `design/roman-v2/qa/*`. The previous `metrics.json` is saved at `<scratch>/mq/metrics-before.json`.

| Section | Mean diff before → after |
|---|---|
| hero | 33.56 → 33.25 |
| career | 34.29 → 38.52 |
| products | 58.79 → 65.77 |
| beyond | 37.36 → 44.87 |
| jj | 31.22 → 31.99 |
| footer | 28.67 → 67.65 |

None of these changes comes from the motion layer: under reduced motion it renders nothing, and the footer hand sits in its final position. The diffs moved because of user WIP content changes made after the previous capture:
- Footer: the new "Festina Lente / Make haste slowly" layout, and the footer navigation block was removed.
- Products: a light screenshot, and the body line was removed.
- Beyond: the card redesign.
- Career: content and CSS edits.

The hero diff may also shift slightly because of the intentional typing pose.

`tsc --noEmit` and `npx eslint src/components src/lib/roman-v2` are both clean.

## Fixes made

1. **`src/components/roman-v2/MusicKnob.tsx`: rotation origin on phones.**
   - Bug: the origin assumed `object-position: left`, but at ≤767 px the strip is right-aligned. At 390 px the face turned around a point 61 px off-centre and swung off the knob.
   - Fix: the origin is now computed from the computed `object-position`. At 390 px it moved from 357.5 px to 296.7 px.
   - The knob is now being rebuilt by another agent, and the coordinator says this fix was kept.
2. **`src/components/roman-v2/CareerJourney.tsx`: 2-step jumps played the second hop at 1×.**
   - Fix: a jump of more than one step now sets `hurry`, so every hop plays at 2×.
   - Verified in both directions.
3. **`src/components/roman-v2/BeyondWork.module.css`, mobile `.readingArt`: `position: static` changed to `position: relative`.**
   - I reported it and the coordinator applied it, because the file was off-limits to me at the time.
   - Bug: the video host had no positioned art box, so it sized to the whole reading card.
   - Result: book diff at 390 px went from 56.2 to 11.3.

## Remaining issues, ranked

1. **Desktop LCP can be the hero video at about 5.7 s.**
   - Cause: the hero still fades in from opacity 0 under IntroReveal, so Chrome often does not report it as an LCP candidate. The loop video (opacity 0 → 1 fade) then becomes the largest entry when it starts after the intro.
   - Pre-motion, the LCP was the H2 at about 0.15 s.
   - Field LCP only counts this when the visitor has not scrolled, clicked or pressed a key before the loop starts.
   - Options, for the user to choose:
     - (a) accept it;
     - (b) let the hero still paint visibly before the intro covers it, so the image is the LCP;
     - (c) delay the hero loop until the first interaction.
2. **Phone LCP regressed under throttling (3.25 s → 5.9 s).** This is not motion. It comes from the hero art change: phones get the 1536 w image at DPR 3, and IntroReveal downloads the same art a second time.
3. **Desktop career card opens on the S4 still, and the S4 idle does not play until a chapter changes.** The mobile accordion does play S4 idle immediately. This matches the shot spec ("after any transition"). Decide whether the desktop card should idle on first view as well (+314 KB).
4. **Phones download the 1080×720 desktop hero loop (406 KB).** The 448×352 `-mobile` clips are only used at 701–899 px. A phone-sized encode of the desktop art would save about 300 KB.
5. **FloatingNav pill height animation causes CLS of 0.011–0.018 on scroll.** This is user WIP in `FloatingNav.module.css`, not motion, but it moved a CLS of 0 above 0.
6. **Knob checks are pending the rebuild.** That covers turning only while music plays, the smooth stop, alignment, and the doubled notch.

Evidence scripts and raw outputs are in `<scratch>/mq/` (`perf*.txt`, `thr-*.txt`, `b-*.mjs`). Screenshots are in `design/roman-v2/motion/qa/`.
