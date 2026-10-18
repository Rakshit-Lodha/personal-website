# Roman v2 motion: encode report

Date: 2026-10-18. Manifest: `src/lib/roman-v2/motion.json` (19 clips + `knob`, incl. `beyond-knob-hand` and `knob.track`). Encoder: `scripts/roman-v2-motion-encode.mjs` (locked background, still-method alpha key, WebM VP9 alpha + HEVC alpha, byte budgets). Knob layers: `scripts/roman-v2-motion-knob.mjs`.

**Total generation spend: $14.68** (`clips/cost-log.jsonl`): $7.92 before this pass, plus $6.76 in this pass. The pass cap was $10. Of the $6.76, $6.40 went on 16 fast-1080p finals and $0.36 on 2 lite r21 takes. No budget violations: every file fits its byte budget, and the hero pairs fit their shared budget.

## Finals (veo-3.1-fast 1080p, 2 takes each): none accepted. All 8 clips keep the approved drafts.

Same prompts and keyframes as the drafts. Each take was post-processed with `roman-v2-motion-post.mjs --crop` (outputs in `clips/final/post/`), then compared to the approved draft side by side at full resolution.

I also measured how closely each take's first and last frames match their keyframes. Mean absolute difference, 0–255, with every frame downscaled to the same 640×360 or 360×640 so resolution doesn't skew it:

| Clip | Draft first / last | Final t1 | Final t2 | Why the finals lose |
|---|---|---|---|---|
| hero-intro-desktop | 2.85 / 3.00 | 4.20 / 5.44 | 4.17 / 4.63 | The halftone behind the head and neck dissolves by 2 s; both takes end without it. The re-render sharpens the marble veining across the face (a material shift against the still). |
| hero-loop (hero-loop4-desktop) | 2.75 / 3.22 | 4.11 / 4.75 | 4.05 / 5.58 | The frame-0 re-render already differs from the keyframe (heavier face veining, thinner halftone right of the neck), so playback would pop against the poster. |
| hero-intro-mobile | 2.94 / 4.56 | 4.01 / 6.15 | 4.10 / 7.94 | A dotted halftone disc appears in the background behind the head (t1 at 1 s; t2 at 1 s and at the end). |
| hero-loop-mobile | 3.00 / 3.91 | 3.84 / 4.78 | 3.85 / 5.40 | The motion is comparable, but the loop seam is worse (post first↔last diff: draft 3.65, finals 4.90 / 6.97) and the keyframe match is worse. |
| jj-listen-desktop | 2.81 / 2.93 | 3.33 / 7.23 | 3.19 / 4.71 | Both hands overshoot to the crown of the head. In t1 the forearm also sticks out below the bust; in t2 the hand sweeps across the face. |
| jj-idle-desktop | 3.28 / 3.23 | 3.46 / 4.07 | 3.55 / 4.33 | In t1 the head tilts well past 5° and the hand leaves the ear. t2 is almost frozen (1.4 % mask), so it doesn't do an idle's job. |
| jj-listen-mobile | 3.05 / 3.21 | 4.21 / 4.58 | 4.29 / 4.61 | The path is similar, but the fingers splay over the hairline and the keyframe match is worse. |
| jj-idle-mobile | 3.09 / 3.26 | 4.21 / 4.64 | 4.25 / 4.97 | In t2 the halftone dissolve and the vignette vanish and the bust redraws mid-clip. t1 is clean but nearly static (4.2 % mask) and matches the keyframes less closely. |

Pattern: veo-3.1-fast re-renders the provided frames instead of holding them. That breaks the hard constraints that matter most here: the halftone, the still match at the start and end, and the seams. The public files and manifest entries for these 8 clips are unchanged (no `encode-overrides.json` was written).

## r21 (INDMoney → LearnApp, base block): left out

The add direction (S1 → S2) was generated as `career-r21-add` in `shots.json` (lite 720p, 2 takes, prompt per `promptRules`). It failed 2 of 2:

- **t1:** the block appears at the top edge on its own before the hand reaches it, and a second left hand comes down while the hovering hand is still there (4.4–5.0 s).
- **t2:** an oversized block is set down off the plinth at the far left, then fades out; there is a ghost arm at the top edge.

Together with the 6/6 failed removals, that is 8 failed takes. Neither `career-r21` nor `career-r21-rev` is in the manifest, so the page crossfades S2 ↔ S1. Takes and post outputs are in `clips/draft/career-r21-add-t{1,2}.mp4` and `clips/draft/post/`.

## Manifest clips (verified from the files on disk)

All 36 files decode with alpha:

- **WebM:** ffprobe reports `vp9`, `yuv420p` with `alpha_mode=1`.
- **MP4:** ffprobe reports `hevc`, `yuv420p` (base layer); the alpha layer is decoded by VideoToolbox.
- **Alpha check:** the decoded middle frame has min alpha 0 in every file. Middle-frame composites over magenta and over the section colour are in `encode-qa/<id>-{webm,mp4}-{magenta,section}.png`.

Other details:

- 24 fps throughout. Manifest `bytes` match the files.
- **Seam** = mean absolute RGBA difference between the first and last decoded frames (0–255). It only matters for loops and idles; intros and transitions end on a different state by design.
- **Budgets:** hero intro + loop share 900 KB on desktop and 400 KB on mobile, per format. Other loops and idles: 500 / 250 KB. Transitions: 300 / 200 KB.

| id | source take | dims | dur | WebM KB | MP4 KB | budget KB | seam webm / mp4 |
|---|---|---|---|---|---|---|---|
| hero-intro-desktop | draft hero-intro-desktop | 1080×720 | 4 s | 402.9 | 408.2 | 900 pair | (intro) 7.70 / 8.24 |
| hero-loop-desktop | draft hero-loop4-desktop-t2 | 1080×720 | 4 s | 396.6 | 366.5 | 900 pair (799.5 / 774.7 used) | 1.71 / 2.34 |
| hero-intro-mobile | draft hero-intro-mobile-t1 | 448×352 | 4 s | 176.0 | 156.7 | 400 pair | (intro) 2.13 / 4.73 |
| hero-loop-mobile | draft hero-loop-mobile-t2 | 448×352 | 4 s | 175.5 | 75.9 | 400 pair (351.5 / 232.6 used) | 3.15 / 3.46 |
| career-r43 | draft career-r43-t3 | 820×604 | 6 s | 296.7 | 255.2 | 300 | (transition) |
| career-r43-rev | same, reversed | 820×604 | 6 s | 292.5 | 255.0 | 300 | (transition) |
| career-r32 | draft career-r32-t1 | 820×604 | 6 s | 274.0 | 280.6 | 300 | (transition) |
| career-r32-rev | same, reversed | 820×604 | 6 s | 269.3 | 280.9 | 300 | (transition) |
| career-idle-s4 | draft career-idle-s4-t2 | 820×604 | 4 s | 306.8 | 110.2 | 500 | 0.46 / 1.01 |
| career-idle-s3 | draft career-idle-s3-t2 | 820×604 | 4 s | 359.0 | 174.7 | 500 | 1.16 / 1.64 |
| career-idle-s2 | draft career-idle-s2-t2 | 820×604 | 4 s | 389.1 | 200.8 | 500 | 0.91 / 1.40 |
| career-idle-s1 | draft career-idle-s1-t2 | 820×604 | 4 s | 431.5 | 240.2 | 500 | 0.73 / 1.36 |
| products-reader-loop | draft products-reader-loop-t1 (eye-only mask) | 1080×720 | 6 s | 222.1 | 126.3 | 500 | 0.01 / 0.25 |
| beyond-book-loop | draft beyond-book-A-t4 + B-t3 (union mask) | 1080×720 | 8 s | 459.6 | 339.2 | 500 | 0.88 / 1.58 |
| jj-listen-desktop | draft jj-listen-desktop-t1 | 1080×720 | 4 s | 493.8 | 485.3 | 500 | (intro) 6.77 / 6.91 |
| jj-idle-desktop | draft jj-idle-desktop-t3 | 1080×720 | 4 s | 485.1 | 492.0 | 500 | 0.22 / 0.54 |
| jj-listen-mobile | draft jj-listen-mobile-t2 | 560×700 | 4 s | 222.3 | 245.5 | 250 | (intro) 9.31 / 9.61 |
| jj-idle-mobile | draft jj-idle-mobile-t2 | 560×700 | 4 s | 226.6 | 216.1 | 250 | 1.56 / 2.84 |

Every clip uses its draft take because it is the approved take (`DRAFTS_QA.md`) and the finals above did not beat it. Per-clip encode logs (crop drift, mask, CRF and quality steps) are in `encode-results.json`.

## Knob layers (code rotation, `MusicKnob.tsx`)

Source: the current `beyond-music` strip (`assets/masters/beyond-music.png`, 536×215, the same pixels as `public/roman-v2/beyond/beyond-music-536.*`). Every layer is a 536×215 lossless WebP with alpha on the strip's pixel grid, in `public/roman-v2/motion/beyond/`:

| layer | bytes | content |
|---|---|---|
| `knob-plate.webp` | 4,184 | Only the face ellipse (+3 px) is opaque. The face is replaced by its notch-free, rotationally symmetric version (radial profile, with skin pixels excluded); finger pixels are kept. Everything else is transparent, because the still sits under it. |
| `knob-face.webp` | 1,724 | The symmetric face plus an engraved notch: a dark groove from 0.34 to 0.88 R with a lit lip toward the upper-left light, pointing about 10° above 3 o'clock at rest. It is antialiased 4×4 and transparent outside the face ellipse. This is the only layer that turns. |
| `knob-highlight.webp` | 6,340 | The still's own brushed specular streaks: the difference between the still and plate + face, as one normal-blend layer. Alpha is capped at 0.6 so the notch still reads through the brightest streak. It stays fixed to the light. |
| `knob-fingers.webp` | 3,282 | The index and thumb tips over the face. Skin is the warm (R−B > 16) region connected to two seeds, with holes filled and soft edges, feathered out between R+2 and R+6 px (beyond that, the still is identical underneath). |

The face is a disc seen from the left: an ellipse with rx 28 and ry 32.5 px centred at (457.5, 94). So `scaleY` = ry / rx = 1.1607. Because that is greater than 1, the page's `scaleY(s) rotate() scaleY(1/s)` keeps it elliptical while it turns.

`motion.json` → `knob`:

```json
{ "size": [536, 215], "center": [457.5, 94],
  "face": "/roman-v2/motion/beyond/knob-face.webp", "plate": "/roman-v2/motion/beyond/knob-plate.webp",
  "highlight": "/roman-v2/motion/beyond/knob-highlight.webp", "fingers": "/roman-v2/motion/beyond/knob-fingers.webp",
  "scaleY": 1.1607 }
```

Verification:

- **Composite at 0°.** The script stacks plate + face (turned with the page's exact transform) + highlight + fingers over the strip. Away from the notch, the 0° result differs from the strip by 0.51 mean and 29 max (0–255, at the capped streak core). Outputs: `encode-qa/knob-{0,90,180,270}.png` and a 4× contact sheet from 0° to 315° (`encode-qa/knob-sheet-4x.png`).
- **What the composites show.** There is only one notch, because the still has none. The index finger covers the notch as it passes under it (around 315°) and the thumb does the same at the lower left. The rim shows no seam and the edges are clean. The notch dims under the bright diagonal glare (around 135°), which reads as glare.
- **On the page.** Headless Chromium at :3000 `/roman-v2`, 1440 px wide at DPR 2. All 4 layers load at 536 px wide. MusicKnob sets the transform origin to 446.86 px / 91.81 px, which is (457.5, 94) × 0.977 (the cover scale). I set the face to 0°, 90° and 180° with the page's transform: alignment is exact, the fingers stay on top, and there were no console errors.

Rebuild: `node scripts/roman-v2-motion-knob.mjs` rewrites the layers, the QA images and the `knob` key. It leaves the clips alone.

## Knob hand loop (`beyond-knob-hand`, 2026-10-18)

The hand now turns the knob: a 4 s loop of the marble hand gripping, twisting about 28° clockwise, releasing and easing back, with the code knob face following its fingertips frame by frame.

**Generation: none (no spend).** The shot is in `shots.json` (`beyond-knob-hand`, first = last = `beyond-knob-master`, which matches the current 536×215 strip at 1.73 mean abs diff). Both lite 720p takes were refused at submit with OpenRouter 402 (insufficient credits), so $0 was spent and `cost-log.jsonl` is unchanged ($14.68 total).

**What ships instead:** `scripts/roman-v2-motion-knob-hand.mjs` renders the loop from the strip itself.

- **Hand layer.** The hand is cut out (the knob layers' warm-key flood from the index and thumb seeds, with a stricter R−B > 19 on the face so the brushed highlight next to the thumb stays metal). It twists about the knob axis in the knob's un-squashed plane. The twist falls off from the fingertips to the wrist: the full angle inside 40 px, then (40/r)², and 0 from 130 px out. Fingertips turn 28° and the knuckles about 3°; the forearm, halftone and red circle do not move. While the hand eases back, the fingertips lift 1.5 px off the rim.
- **Background plate.** The hand moves over a plate with its moving part removed. Around the knob, the plate is rebuilt from the knob's radial profile, taken from the unoccluded left half. On the panel, it is rebuilt by normalized convolution. So the rim, the tick ring and the panel never warp (`encode-qa/knob-hand-plate.png`).
- **One video, not two.** The clip is opaque over the whole strip except a window over the knob face (the ellipse inset by 1 px), wherever no finger covers it. The page puts the code face and highlight under the video, so the fingertips are always on top of the turning face. Because this is one stream, the hand and the fingertips cannot drift apart, and no separate fingertip-matte clip (`beyond-knob-fingers`) is needed.
- **Encode.** 1072×430, which is 2× the strip (HEVC needs even sizes, and 215 is odd). 96 frames at 24 fps. Same codec settings as the encoder: WebM VP9 alpha at 87.9 KB (crf 30), HEVC alpha hvc1 at 51.9 KB (q 50 / 0.75). Both are under 250 KB.
  - Seam: 0.00 (webm) and 0.53 (mp4).
  - Frame 0 against the 2× strip (opaque pixels): 1.37 (webm) and 4.96 (mp4, HEVC colour conversion). The other HEVC clips use the same settings.
- **Highlight.** The highlight layer (`roman-v2-motion-knob.mjs`) is now filled under the fingers from the same angle elsewhere on the face, so a finger that moves away uncovers a whole face. That script now keeps `knob.track` when it rewrites `knob`. Run it first, then the hand script.

**Sync track:** `motion.json` → `knob.track = { fps: 24, angles: [96 values] }`.

- **Measurement.** On every rendered frame, the index fingertip's skin (soft R−B key 18→30) is taken in a band on the rim (r from RX−12 to RX+3), in the upper sector (−160° to −20°). That gives an angular profile, smoothed with σ 1.5°. Each frame's profile is registered against frame 0's, in 0.02° steps.
- **From fingertip to knob.** The knob advances by the fingertip's clockwise steps and holds while the fingertip goes back.
- **Result.** The fingertip peaks at 27.98° (28° rendered) and returns to 0.00 at the seam. The track is 0 → 27.84°, monotonic, and flat from about 2.0 s to the end, so one loop = 27.84°.

**Page** (`MusicKnob.tsx`, `LoopVideo.tsx`, `BeyondWork.module.css`):

- **Layer order.** Still → knob layers (plate, face, highlight, and the still's fingertips until the loop is on screen) → `LoopVideo loop="beyond-knob-hand"`.
- **When it plays.** While the card is active or a song plays.
- **Face angle.** `loops × 27.84° + angles[round(mediaTime × 24)]`, read on every presented frame through `requestVideoFrameCallback`, or rAF on `currentTime` while the video plays. A wrap to the start counts one more loop, so the knob keeps turning across loops. Paused, the video holds its frame and the knob holds with it.
- **LoopVideo.** Gains one optional prop, `onShow(video)`, called once a clip has faded in.
- **Phones.** The knob layers and the loop now sit in the picture's 419 px box, so they crop like the still at every phone width.
- **Reduced motion / Save-Data.** Still only, as before.

**Verified** in headless Chromium against `:3000/roman-v2`. Console errors: 0.

- **Desktop 1440, DPR 2, hovering the music card.** `encode-qa/knob-hand-desktop-sheet.png` has 8 frames over about 4 s. The hand twists and the notch advances with it: 0 → 4.6 → 23.5 → 27.8° in loop 1, then 27.8° plus loop 2.
- **Leaving the card.** The video pauses (t 1.078 s) and the knob holds at 36.4°.
- **Song playing, card not hovered.** The loop keeps playing, and the knob keeps accumulating (55.7°).
- **Phones, 390 wide, iPhone UA and Android UA.** With the card in view, the loop plays (VP9 in Chromium) and the transform origin is 357.6 / 73.4 px, which is (457.5, 94) × 0.7817 in the 419 px box. Scrolled away, it pauses. Screenshots: `encode-qa/knob-hand-mobile-{iphone,android}.png`.
- **Alignment.** No ghost hand, no doubled knob, fingertips on the knob, and no box edges. Offline page composites: `encode-qa/knob-hand-sheet.png` and `knob-hand-composite-0.png`. Window alpha: `knob-hand-alpha.png`.

**Limitations.**

- The motion is a 2D twist of the still's hand, not a re-performed hand. The fingers bend slightly between the knuckles and the tips, and the rebuilt panel between the fingers is a little flatter than the original texture. Both are small at the card's size.
- The HEVC path (Safari / iOS) was checked by decoding with ffmpeg (alpha present, 96 frames), not in a WebKit browser.

### Veo trial for the hand loop (2026-10-18, after the credit top-up): not shipped

The live knob is still the 2D twist above: the public files, the manifest entry and `knob.track` are unchanged.

**4 lite 720p takes, $0.48 in total** (4 × $0.12, logged in `cost-log.jsonl`; the cap was $1.00). Generation was stopped on request after t4.

| Take | Prompt | Result |
|---|---|---|
| t1 | revision 1 | Reject. The index finger slides down the knob's left side, then lifts off and straightens past the knob (about 2.7 s). |
| t2 | revision 1 | Reject. The index finger vanishes behind the thumb (about 1.3 s), then points away from the knob. |
| t3 | revision 2 (fingertips must stay on the rim) | Reject. The index finger folds away mid-clip. |
| t4 | revision 2 | Usable motion. The fingertips stay on the knob, and the index finger rolls down the right side and back. |

Takes are in `clips/draft/beyond-knob-hand-t{1..4}.mp4`. The per-take notes are in `shots.json`.

**t4 encoded through the new `--take` branch** of `scripts/roman-v2-motion-knob-hand.mjs`:

- **Branch steps.** The take is cropped to the strip and aligned to the still (drift 0,1 at 2×). Wherever the take stays within codec noise of the still, the still is kept. Around the knob, the take's background is replaced by the rebuilt plate. The knob window is cut wherever no finger covers it.
- **Encode.** WebM 177.6 KB, HEVC 95.1 KB. Seam 0.21 / 1.01.
- **Saved under `clips/knob-veo-t4/`:** the two encoded files, plus the manifest entry and track as `manifest-veo-t4.json`. The encode log is `encode-results.json` → `beyond-knob-hand-veo-t4`.
- **QA images:** `encode-qa/knob-hand-veo-{sheet,composite-0,alpha}.png`.
- **Track: not reliable.** The fingertip measurement on a deforming real finger jumped (perLoop 105.9°), so the knob track would need more work before this take could ship.

The 2D version's files are also backed up in `clips/knob-2d/`.

To try the Veo take again: run `node scripts/roman-v2-motion-knob-hand.mjs --take design/roman-v2/motion/clips/draft/beyond-knob-hand-t4.mp4`. This overwrites the live clip and `knob.track`. To restore the 2D version, re-run the script without `--take`.
