# Roman v2 motion keyframes — QA log

Model: `gpt-image-2.5-sunburst` via `POST /v1/images/edits` (PNG, `quality: high`; the model rejects `input_fidelity`). Script: `scripts/roman-v2-keyframes.mjs`. Every frame was viewed at full resolution, plus zoomed crops of the faces, hands and seams.

**What we learned:** the model treats the mask as a hint and re-renders the whole picture. Faces drift badly: the hero became a different young man, and the JJ bust became a female statue. So the script never ships raw edit output. It composites the edit back over the source only inside a feathered region, so pixels outside the region are byte-identical to the master. Head poses are made with a rigid, feathered rotation of the master's own pixels about the neck, so identity is exact.

**Cost:** 16 edit calls. Each call used about 1.75k input tokens (1.5k image) and 1.37k output tokens (1.76k for the 1024² mobile call). The API returns no dollar price for this model. At gpt-image-1 rates ($5/M text in, $10/M image in, $40/M image out) that is about **$0.07 per call and about $1.15 total**. This is an estimate and the real rate is unknown. Per-call usage is in `work/usage.jsonl`. Rejected outputs are kept in `work/rejected/`.

| Frame | Result | Method | Tries | Notes |
|---|---|---|---|---|
| hero-typing-desktop-master | accepted | master padded 284 px left | 0 | — |
| hero-typing-desktop-peak | accepted | edit (hands) + 5° head warp | 3 | Tries 1–2 (head-turn edits) rejected for identity drift: different face, lighter hair, head moved down/left. Try 3 asked for a hands-only edit. The head is the master tilted 5° toward the laptop. Minor: the laptop base's right end is ~10 px shorter, with a faint edge at the feather boundary. |
| hero-typing-mobile-master | accepted | master padded on top to 9:16 | 0 | The 9:16 canvas is 44% empty ground above the figure, by design (crop rect restores the square). |
| hero-typing-mobile-peak | accepted | edit (hands) + 5° head warp | 1 | Same faint laptop-end edge as desktop. Hands have 5 fingers. |
| career-s4 | accepted | master | 0 | Paytm Money, the full structure |
| career-s3 | accepted | edit composited in cube/left-hand region | 1 | Cube removed. The left hand hovers open. |
| career-s2 | accepted | edit composited in pillar region | 1 (+1 re-composite) | First composite left a faint ghost of the pillar top because the region was too tight. Widening the region over the cached result fixed it. |
| career-s1 | accepted | edit composited in sphere region | 4 | Try 1 (remove steps + sphere, hand on arch) reshaped and widened the arch, added sparkle artefacts and ghosted the old fingertips. Try 2 added a new slab and ghosted the hand. Try 3 deleted the right hand and grew a second arch piece. Try 4 removes only the sphere: clean. Chronology is now sphere → INDMoney. |
| career accumulation check | pass | numeric diff | — | S3 vs master, S2 vs S3 and S1 vs S2 differ only inside their edit regions (bboxes 707–1166×209–646, 1071–1366×274–641, 1428–1671×619–826). No block moves between states. |
| products-reader-master | accepted | master | 0 | — |
| products-reader-peak | accepted | 3° head warp about the hair/frame join | 1 edit + 3 warps | Edit rejected: it made a smaller, different head, with a ghosted chin and a seam. Warp 1 (4° about the neck) and warp 2 left ghost curls over the black screen. Warp 3 pivots at the hair/frame join (500, 300), so the frame corner stays still and the chin tucks: clean. The screen interior is untouched #141413. |
| beyond-book-master | accepted | master padded 284 px left | 0 | — |
| beyond-book-peak | accepted | edit composited over right page block + curl only | 2 (+1 re-composite) | Try 1 rearranged the whole book: the Colosseum moved into the book and ghost sheets appeared. Try 2 had a good curling page, but it redrew the landscape engraving. The re-composite keeps the edit only on the page block and curl, so the engravings stay the master's. |
| beyond-knob-master | accepted | master | 0 | — |
| beyond-knob-peak | **dropped** | — | 1 edit + 2 warps | Edit rejected: it added a white indicator line, enlarged the knob and ghosted the wrist. Rigid-rotation warps ghosted the curled lower fingers against the red circle edge. The shot uses a single first=last=master clip instead. A knob is rotationally symmetric, so a peak frame adds nothing visible. |
| jj-desktop-master / jj-mobile-master | accepted | master padded (16:9 even / 9:16 on top) | 0 | — |
| jj-desktop-speaking-peak | accepted | 5° nod warp (head + cupped hand) | 1 edit + 2 warps | Edit rejected: identity changed to a female statue with closed eyes. Warp 1 left a faint second hair edge. A larger region fixed it. |
| jj-mobile-speaking-peak | accepted | 4° nod warp | 1 edit + 2 warps | Same failure and fix as desktop. |
| footer-hand-start / -end | accepted | sharp translate of the keyed 1254 export | 0 | Code-motion storyboard only. |

**Checks on all accepted frames:** no text or letters introduced, no extra fingers, flat grounds unchanged (the pad colour is the median border colour of each master), and no style mismatch inside the composited regions.

---

## Round 2 (user review)

Round 2 added these script features in `scripts/roman-v2-keyframes.mjs`:
- **Reference images:** extra images passed to the edit (sent as `image[]`).
- **Multiple variants:** `n` variants per call, with `pick` choosing the one used.
- **Crops:** `crop` / `compositeRegions` control what is sent and what is pasted back.
- **Upscaled masters:** a master can be upscaled before use.
- **Copy padding:** `padMode: copy` repeats edge pixels instead of a flat colour.
- **Knob notch:** `notch` draws the knob's indicator line.

Retired frames (hero and JJ peaks, products peak, the round-1 knob master) are in `work/superseded/`.

**Cost:** round 2 made 11 calls that returned about 25 images. At gpt-image-1 rates that is about **$2.38**, so the total across both rounds is about **$3.53** (27 calls). The real price is unknown.

| Frame | Result | Method | Tries | Notes |
|---|---|---|---|---|
| hero-typing-desktop-typing | accepted (v1 of try 3) | multi-image edit + head/neck composite | 3 calls × 3 variants | **Try 1** (master + identity photo, whole-frame edit): heads looked down, but the hair was lighter and looser, the head was larger, and there was a ghost of the master hair above. **Try 2** (head crop sent at 1024²): the hair turned ivory marble, the faces went frontal and enlarged, and the brooch was lost. Rejected. **Try 3** (master + master-head close-up + identity photo, region extended to the top edge): all 3 variants were identity-faithful, with the same tight dark curls, slim face, rectangular glasses and smile. Head lowered ~20° with eyes down-left on the screen. Composite is clean. One small difference: the halftone behind the head is sparser than in the master. |
| hero-typing-mobile-typing | accepted (v1) | same as desktop try 3 | 1 call × 3 | All 3 variants were faithful. The first composite cut off the hair on the left; widening the composite region fixed it. |
| career-s1 (LearnApp) | accepted (v0 of try 2) | edit composited in the left-block region | 2 calls (1 + 2 variants) | **Try 1** left a translucent halftone "box" where the block had been. **Try 2** v0 is clean: the block is gone, the halftone fades out, and the arch is untouched. The composite region was widened to the left, with a softer feather, to avoid a vertical seam. A faint lighter band remains at the region top, behind the fingertips; it is minor. |
| career accumulation check | pass | numeric diff | — | Each state differs from the next only inside its edit region: S3 vs S4 inside 707–1166×209–646, S2 vs S3 inside 1071–1366×274–641, S1 vs S2 inside 669–993×531–839. Each lower state is a strict subset of the one above. |
| products-reader | no new frame | — | 0 | Single loop on the master. An eye-region edit was skipped because every edit of this head re-renders it at a different scale (round 1), so a small eye patch cannot line up. |
| beyond-knob-master | rebuilt | new master | 0 | The page master changed to the 536×215 strip (commit 4e2fb82) and is upscaled 3× (Lanczos). The 16:9 canvas repeats the strip's edge rows: there are visible streaks in the padding, which is cropped away. |
| beyond-knob-n0 | accepted (drawn notch) | synthetic engraved groove | 1 edit call (2 variants) rejected | Both edit variants moved and enlarged the knob, so a composite left half a knob. Pixel-rotating that edit smeared the whole face. The notch is instead drawn as a dark radial groove with a hairline highlight, centred on the face's conic axis (1368, 276). Warm finger pixels are skipped, so the notch goes under the fingers. |
| beyond-knob-n120 / n240 | accepted | same notch at +120° / +240° | 0 | The brushed highlight, tick ring and fingers are identical, as on a real knob: the hand has re-gripped in its home pose. |
| jj-desktop-start | accepted (v0 of try 1, recomposited) | edit (crop 700×840) composited in the arm/ear region | 2 calls × 3 | **Try 1** v0 was faithful: same face, the ear and curls rebuilt, and the arm out of frame. Its shoulder was cut straight because it hit the crop edge. **Try 2** (wider crop) returned one variant with a black box in the masked area, and smaller heads in the others. Fix: reuse try 1 v0 with the composite stopping at x 1210, so the master's halftone shoulder dissolve continues. |
| jj-mobile-start | accepted (v2 of try 2) | edit composited in the arm/ear region | 2 calls × 3 | **Try 1:** all 3 variants came back black in the masked area, because the mask touched the image edges. **Try 2**, with an inset mask, gave v2 clean: ear and curls rebuilt, the face is the master's, and the arm is out of frame. A tiny faint blob remains to the right of the hair. |

Learned: when the mask touches the image border, this model sometimes returns the masked area black or transparent, so masks are now kept inset from the edges.
