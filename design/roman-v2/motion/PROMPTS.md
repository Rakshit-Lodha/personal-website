# Roman v2 — motion video prompts (storyboard, not yet generated)

## Round 2 changes

- hero: new TYPING keyframe — head re-posed down-left onto the laptop screen (identity photo + master head as references, composited onto the master); clips are now intro (master → typing, once) + an 8 s loop on the typing pose with small head movements. Round-1 peak frames retired.
- career: progressive REMOVAL top-down from Paytm Money (full) to LearnApp; each step lifts away one sizeable piece (top cube, tall upright block, large square base block). LearnApp state regenerated; removal clips replace the additive transitions; up the list = reversed encodes.
- products-reader: single 8 s loop on the master with timed reading saccades and two blinks (prompt-driven); round-1 tilt peak retired.
- beyond-knob: rebuilt on the current 536×215 music strip; engraved indicator notch added; three +120° frames (n0/n120/n240) and three 4 s clips make a full-turn seamless loop with finger re-grips. Code-rotation fallback documented.
- jj: new START keyframes (hand lowered out of frame, ear and curls rebuilt); clips are listen (start → master, once on entering view) + idle loop. Speaking variant dropped; not tied to JJ on/off.

One entry per Veo clip. Request shape (OpenRouter `POST /v1/videos`): `model`, `prompt`, `duration` (Veo 3.1 accepts 4, 6 or 8 s), `resolution`, `aspect_ratio`, `generate_audio: false`, `frame_images: { first_frame, last_frame }`, plus the `negativePrompt` passthrough. Drafts: `google/veo-3.1-lite` @ 720p. Finals: `google/veo-3.1-fast` @ 1080p. Machine-readable copy: [shots.json](shots.json). Visual storyboard: [storyboard.html](storyboard.html).

## Cost

OpenRouter list price (USD per output second, no audio, fetched 2026-10-17): lite $0.03 (720p) / $0.05 (1080p); fast $0.08 (720p) / $0.10 (1080p). Image inputs are not priced separately.

| | Clips | Seconds | Lite 720p | Lite 1080p | Fast 720p | Fast 1080p |
|---|---|---|---|---|---|---|
| All clips, one take each | 21 | 124 | $3.72 | $6.20 | $9.92 | $12.40 |

Budget for retakes: plan on ~2 lite drafts per clip before a single fast final (≈ $19.84).

Career idle loops play for 4 s. Career moves up the list are ffmpeg reversals of the removal clips (no generation cost).

## Prompt rules (revision 3, after the hero draft round)

- Loops are 4 s unless the beats need more (career removals 6 s: lift, carry out of frame and return the empty hand; products-reader 6 s: two blinks in 4 s read as twitching).
- Every prompt carries a "Hard constraints" line: what must not move, where the gaze stays, max head rotation (~3–5°), hands stay in place, explicit no chin-lift / no upward glance.
- The halftone is described as a fixed printed texture that never fades, flickers or crawls.
- Loops use first = last frame; one-shot clips end and hold on the provided last frame.
- The "Avoid:" list is part of the prompt text (the API ignores a separate negative prompt).
- Every take is post-processed with scripts/roman-v2-motion-post.mjs (locked-background cinemagraph) and cropped with cropToPage.
- No hex colour codes in prompt text — Veo can render them as on-screen text (jj-idle-desktop-t2 drew "#59112"); name colours in words.
- Hand removals: the hand and forearm stay one continuous limb and return along the same path; nothing is left behind where the hand was (round-1 drafts left an empty sleeve and popped the hand back in).

Draft results and QA: [DRAFTS_QA.md](DRAFTS_QA.md) · review page: [drafts.html](drafts.html).

## Shared negative prompt

`text, letters, numbers, captions, logos, watermark, subtitles, new objects, extra people, extra hands, extra fingers, six fingers, fused fingers, deformed hands, face change, identity change, different person, camera movement, zoom, pan, tilt, dolly, handheld shake, rack focus, depth-of-field change, background colour change, gradient, vignette, flicker, texture boiling, halftone pattern changing or crawling, lighting change, colour grading shift, morphing, melting, cuts, scene change, motion blur trails`

---

## hero-typing-desktop — Hero (desktop, 16:9)

- **Trigger:** Poster = the approved master. When the hero is in view (after LCP), play "intro" once, then loop "loop" while in view; paused offscreen or when the tab is hidden. Coming back into view resumes the loop — the intro never replays. Reduced motion / Save-Data: the master poster only.
- **Loop method:** intro (master → TYPING, once) + single-clip loop (first = last = TYPING). The TYPING pose is a real head re-pose (head lowered ~20°, eyes on the screen) generated with the identity photo and the master head as references and composited onto the master. The loop starts and ends on that same frame, so it is seamless and his gaze never returns to the viewer.
- **Composition on the page:** Crop with pageCropNormalized, then key the #f3e7d8 ground as for hero-figure and place right-aligned over the CSS circle exactly where the still sits.

### hero-intro-desktop (intro (once))

- first_frame: `keyframes/hero-typing-desktop-master.png` · last_frame: `keyframes/hero-typing-desktop-typing.png`
- 4 s · 16:9 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4)
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0.15604,0,0.84396,1]`

| Time | Beat |
|---|---|
| 0–0.8 s | Still: he looks out to the left with his gentle smile, fingers resting on the keys. |
| 0.8–2.6 s | He turns his head down and to the left, chin dropping about 20°, until his eyes land on the laptop screen; the smile softens into focus. |
| 1.6–3.4 s | His fingers start typing: small alternating key taps, wrists still. |
| 3.4–4.0 s | Settles exactly into the last frame: head lowered, eyes on the screen, fingers on the keys. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same young man rendered as a carved warm-ivory marble statue in a draped toga — the same face, short wavy dark-brown hair, thin rectangular metal glasses, gentle smile, ear and jaw as in the first frame; he is seated with a matte-black laptop on his lap, hands on the keyboard. His identity must not change at any moment.
Motion beats: 0–0.8 s: Still: he looks out to the left with his gentle smile, fingers resting on the keys. 0.8–2.6 s: He turns his head down and to the left, chin dropping about 20°, until his eyes land on the laptop screen; the smile softens into focus. 1.6–3.4 s: His fingers start typing: small alternating key taps, wrists still. 3.4–4.0 s: Settles exactly into the last frame: head lowered, eyes on the screen, fingers on the keys.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake. Framing and scale identical to the provided frames for the whole clip.
Lighting continuity: the same soft key light from the upper left, same soft shadows, no flicker, no exposure change.
Background: perfectly flat #f3e7d8 with no texture, no gradient, no vignette, no colour drift. The left margin is empty flat ground and stays empty — do not extend the figure into it.
Materials: everything carved stays carved warm-ivory marble with fine tan veining (no skin, no cloth sheen); the laptop stays matte black with the same lid angle and the screen facing away from camera; The square-dot halftone dissolve stays static (each square in place; at most an imperceptible shimmer).
Loop: the clip must end exactly on the provided last frame; it is concatenated with a matching clip into a seamless loop.
No text, no new objects, no identity change, no extra fingers, no camera motion, no background change. Silent.
```

**Negative prompt:** shared (above).

### hero-loop-desktop (loop)

- first_frame: `keyframes/hero-typing-desktop-typing.png` · last_frame: `keyframes/hero-typing-desktop-typing.png`
- 8 s · 16:9 · draft google/veo-3.1-lite 720p ($0.24) · final google/veo-3.1-fast 1080p ($0.8)
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0.15604,0,0.84396,1]`

| Time | Beat |
|---|---|
| 0–2.0 s | Steady typing while reading the screen; eyes stay on the screen. |
| 2.0–3.0 s | A slight nod down (about 2°) as if reading a line; fingers pause for a beat. |
| 3.0–4.6 s | A quick burst of typing; the head tilts about 2° to his left, still looking at the screen. |
| 4.6–6.0 s | A small thoughtful nod back up; one hand lifts slightly and comes back onto the keys. |
| 6.0–8.0 s | Light typing and the head eases back to exactly the first-frame pose. He never looks away from the screen or toward the viewer. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same young man rendered as a carved warm-ivory marble statue in a draped toga — the same face, short wavy dark-brown hair, thin rectangular metal glasses, gentle smile, ear and jaw as in the first frame; he is seated with a matte-black laptop on his lap, hands on the keyboard. His identity must not change at any moment.
Motion beats: 0–2.0 s: Steady typing while reading the screen; eyes stay on the screen. 2.0–3.0 s: A slight nod down (about 2°) as if reading a line; fingers pause for a beat. 3.0–4.6 s: A quick burst of typing; the head tilts about 2° to his left, still looking at the screen. 4.6–6.0 s: A small thoughtful nod back up; one hand lifts slightly and comes back onto the keys. 6.0–8.0 s: Light typing and the head eases back to exactly the first-frame pose. He never looks away from the screen or toward the viewer.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake. Framing and scale identical to the provided frames for the whole clip.
Lighting continuity: the same soft key light from the upper left, same soft shadows, no flicker, no exposure change.
Background: perfectly flat #f3e7d8 with no texture, no gradient, no vignette, no colour drift. The left margin is empty flat ground and stays empty — do not extend the figure into it.
Materials: everything carved stays carved warm-ivory marble with fine tan veining (no skin, no cloth sheen); the laptop stays matte black with the same lid angle and the screen facing away from camera; The square-dot halftone dissolve stays static (each square in place; at most an imperceptible shimmer).
Loop: the clip must end on a frame identical to its first frame so it loops seamlessly.
No text, no new objects, no identity change, no extra fingers, no camera motion, no background change. Silent.
```

**Negative prompt:** shared (above).

---

## hero-typing-mobile — Hero (mobile, 9:16)

- **Trigger:** Poster = the approved master. When the hero is in view (after LCP), play "intro" once, then loop "loop" while in view; paused offscreen or when the tab is hidden. Coming back into view resumes the loop — the intro never replays. Reduced motion / Save-Data: the master poster only.
- **Loop method:** intro (master → TYPING, once) + single-clip loop (first = last = TYPING). The TYPING pose is a real head re-pose (head lowered ~20°, eyes on the screen) generated with the identity photo and the master head as references and composited onto the master. The loop starts and ends on that same frame, so it is seamless and his gaze never returns to the viewer.
- **Composition on the page:** Crop with pageCropNormalized (the lower 1254×1254 square) and place where hero-figure-mobile sits.

### hero-intro-mobile (intro (once))

- first_frame: `keyframes/hero-typing-mobile-master.png` · last_frame: `keyframes/hero-typing-mobile-typing.png`
- 4 s · 9:16 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4) · prompt revision 3
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0,0.43742,1,0.56258]`

| Time | Beat |
|---|---|
| 0–0.8 s | Still: he looks out to the left with his gentle smile, fingers resting on the keys. |
| 0.8–2.6 s | He turns his head down and to the left, chin dropping about 20°, until his eyes land on the laptop screen; the smile softens into focus. |
| 1.6–3.4 s | His fingers start typing: small alternating key taps, wrists still. |
| 3.4–4.0 s | Settles exactly into the last frame: head lowered, eyes on the screen, fingers on the keys. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same young man rendered as a carved warm-ivory marble statue in a draped toga — the same face, short wavy dark-brown hair, thin rectangular metal glasses, gentle smile, ear and jaw as in the first frame; seated with a matte-black laptop on his lap. His identity must not change at any moment.
Motion beats: 0–0.8 s: Still: he looks out to the left with his gentle smile, fingers resting on the keys. 0.8–2.6 s: He turns his head down and to the left, chin dropping about 20°, until his eyes land on the laptop screen; the smile softens into focus. 1.6–3.4 s: His fingers start typing: small alternating key taps, wrists still. 3.4–4.0 s: Settles exactly into the last frame: head lowered, eyes on the screen, fingers on the keys.
Hard constraints: BOTH hands stay on the keyboard for the entire clip — no hand lifts, no gestures, no fist, no waving. The head makes ONE smooth turn down to the screen and stops there — no overshoot, no look back up, never toward the viewer. The torso, toga folds, laptop and chair do not move.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat warm cream, no texture, gradient, vignette or colour drift; the empty top area of the frame stays empty flat ground — do not extend the figure into it.
Materials: everything carved stays warm-ivory marble with fine tan veining; the laptop stays matte black with the same lid angle and the screen facing away from camera. The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
End: the clip settles exactly on the provided last frame and holds it.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

### hero-loop-mobile (loop)

- first_frame: `keyframes/hero-typing-mobile-typing.png` · last_frame: `keyframes/hero-typing-mobile-typing.png`
- 4 s · 9:16 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4) · prompt revision 3
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0,0.43742,1,0.56258]`

| Time | Beat |
|---|---|
| 0–2.0 s | Continuous light typing with both hands; his head dips about 2° as if reading a line, eyes on the laptop screen. |
| 2.0–4.0 s | Typing continues and his head eases back to exactly the first-frame pose. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same young man rendered as a carved warm-ivory marble statue in a draped toga — the same face, short wavy dark-brown hair, thin rectangular metal glasses, gentle smile, ear and jaw as in the first frame; seated with a matte-black laptop on his lap. His identity must not change at any moment.
Motion beats: 0–2.0 s: Continuous light typing with both hands; his head dips about 2° as if reading a line, eyes on the laptop screen. 2.0–4.0 s: Typing continues and his head eases back to exactly the first-frame pose.
Hard constraints: BOTH hands stay on the keyboard for the entire clip — no hand lifts, no gestures, no fist, no waving. His gaze stays on the laptop screen the entire time — no chin lift and no upward glance at any point, he never raises his head, never looks up, never looks toward the viewer. Head movement stays within about 5° of the first frame. Only small finger taps and tiny head nods; the torso, toga folds, laptop and chair do not move.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat warm cream, no texture, gradient, vignette or colour drift; the empty top area of the frame stays empty flat ground — do not extend the figure into it.
Materials: everything carved stays warm-ivory marble with fine tan veining; the laptop stays matte black with the same lid angle and the screen facing away from camera. The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
Loop: the clip ends on a frame identical to its first frame.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

---

## career — Work, over time (desktop (same crop reused in the ≤899 accordion), 16:9)

- **Trigger:** Chapter change. The page opens on Paytm Money (the latest, full structure). Moving DOWN the list towards LearnApp plays the removal clips; moving UP plays their reversed encodes. After any transition, that state's idle loop plays while in view.
- **Loop method:** progressive removal: 3 removal clips (+ reversed encodes) + 4 single-clip idle loops (first = last = state). Every step removes one sizeable, clearly visible piece, lifted away by a hand: the top cube (Paytm Money → ET Money), the tall upright block (→ INDMoney), the large square base block (→ LearnApp). Each lower state is a strict subset of the one above (pixel-diff checked); clips start and end exactly on state frames, so they chain without pops.
- **Composition on the page:** Crop with pageCropNormalized (= the asset masterCrop 600,90,1072,790) and key the #f6eee5 ground like career-hands.
- **States (top-down; each lower state is a strict subset of the one above):**
  - `career-s4` — Paytm Money (2026–now): Full structure — the approved still; the left hand is setting the top cube.
  - `career-s3` — ET Money (2022–2026): − the top cube (lifted off by the left hand, which now hovers empty).
  - `career-s2` — INDMoney (2020–2022): − the tall upright block behind the arch.
  - `career-s1` — LearnApp (2018–2020): − the large square base block on the left: only the arch, the low steps and the sphere remain.
- **Playback:**
  - State map: Paytm Money → S4 (default on load, the approved still as poster), ET Money → S3, INDMoney → S2, LearnApp → S1. The timeline lists newest first, so moving down the list = going back in time = removing pieces.
  - Down the list (to an older chapter): play the removal clips in order (r43, r32, r21). Up the list (to a newer chapter): play the same clips reversed (ffmpeg -vf reverse, no extra generation) — the hand brings the piece down from above and sets it in place.
  - Multi-step jumps (e.g. Paytm Money → LearnApp) chain the clips at playbackRate 2; three queued steps crossfade (200 ms) straight to the target still instead.
  - Rapid/keyboard switching (arrow keys over the tablist): keep only the latest target. A selection during a clip lets it finish at 2× (clips always end on a state frame), then routes toward the newest target. Chapter text updates immediately; the art catches up.
  - Idle: after a transition, the target state's 6 s idle loops while the section is in view; paused offscreen or with the tab hidden.
  - Reduced motion / Save-Data: no video. Each chapter swaps to its state still (S1–S4 previews as posters) with a 150 ms opacity crossfade.
- **Alternative considered:** Round 1 accumulated chronologically (LearnApp emptiest, adding upward). Round 2 follows how people actually use the page — it opens on the current chapter and they read downward — so each step down is a visible removal, and the ET → INDMoney step now removes the large upright block (the round-1 INDMoney step only added a small sphere).

### career-r43 (removal)

- first_frame: `keyframes/career-s4.png` · last_frame: `keyframes/career-s3.png`
- 6 s · 16:9 · draft google/veo-3.1-lite 720p ($0.18) · final google/veo-3.1-fast 1080p ($0.6) · prompt revision 4
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0.35864,0.09564,0.64077,0.83953]`

| Time | Beat |
|---|---|
| 0–0.5 s | Hold: nothing moves. |
| 0.5–2.2 s | The left hand tightens its pinch on the small top cube and lifts it straight up off the square block. |
| 2.2–3.8 s | The hand carries the cube up and out through the top edge of the frame. |
| 3.8–5.4 s | The empty left hand comes back down into frame and hovers, relaxed and open, just above the now-bare block. |
| 5.4–6.0 s | Hold on the exact last frame. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same two carved marble hands and draped forearms over a long marble plinth with a small structure of geometric marble blocks; every hand has exactly five fingers.
Motion beats: 0–0.5 s: Hold: nothing moves. 0.5–2.2 s: The left hand tightens its pinch on the small top cube and lifts it straight up off the square block. 2.2–3.8 s: The hand carries the cube up and out through the top edge of the frame. 3.8–5.4 s: The empty left hand comes back down into frame and hovers, relaxed and open, just above the now-bare block. 5.4–6.0 s: Hold on the exact last frame.
Hard constraints: Only the left hand and small top cube move. The small top cube is carried away as one rigid object: it keeps its exact shape and size, does not rotate, and leaves through the top edge of the frame — it never fades, dissolves or vanishes in place. Every other block stays exactly where it is, with no shift or wobble, and no new block appears in its place. The right hand stays completely still. The forearms move only as the hand requires; the drapery does not move. The hand and forearm stay one continuous limb attached to the same sleeve the whole time: the hand leaves through the top edge with the cube and comes back down along the same path — it never pops in, fades in or enters from another side. Nothing is left behind where the hand was: no empty sleeve, no hanging cloth, no second hand. The cube never comes back into the frame.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat warm off-white, no texture, gradient, vignette or colour drift.
Materials: everything carved stays warm-ivory marble with fine tan veining; blocks are the same speckled ivory stone and stay rigid (no bending, melting, shrinking or fading). The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
End: the clip settles exactly on the provided last frame and holds it.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, blocks moving, blocks fading or popping, new blocks. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

### career-r32 (removal)

- first_frame: `keyframes/career-s3.png` · last_frame: `keyframes/career-s2.png`
- 6 s · 16:9 · draft google/veo-3.1-lite 720p ($0.18) · final google/veo-3.1-fast 1080p ($0.6) · prompt revision 3
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0.35864,0.09564,0.64077,0.83953]`

| Time | Beat |
|---|---|
| 0–0.5 s | Hold: nothing moves. |
| 0.5–1.8 s | The right hand rises from the low steps and closes around the top of the tall upright block behind the arch. |
| 1.8–3.8 s | It lifts the tall block straight up — perfectly upright, no rotation — and out through the top edge of the frame. |
| 3.8–5.4 s | The empty right hand returns down into frame and settles its fingertips back on the steps exactly where they were. |
| 5.4–6.0 s | Hold on the exact last frame. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same two carved marble hands and draped forearms over a long marble plinth with a small structure of geometric marble blocks; every hand has exactly five fingers.
Motion beats: 0–0.5 s: Hold: nothing moves. 0.5–1.8 s: The right hand rises from the low steps and closes around the top of the tall upright block behind the arch. 1.8–3.8 s: It lifts the tall block straight up — perfectly upright, no rotation — and out through the top edge of the frame. 3.8–5.4 s: The empty right hand returns down into frame and settles its fingertips back on the steps exactly where they were. 5.4–6.0 s: Hold on the exact last frame.
Hard constraints: Only the right hand and tall upright block move. The tall upright block is carried away as one rigid object: it keeps its exact shape and size, does not rotate, and leaves through the top edge of the frame — it never fades, dissolves or vanishes in place. Every other block stays exactly where it is, with no shift or wobble, and no new block appears in its place. The left hand stays completely still. The forearms move only as the hand requires; the drapery does not move.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat warm off-white, no texture, gradient, vignette or colour drift.
Materials: everything carved stays warm-ivory marble with fine tan veining; blocks are the same speckled ivory stone and stay rigid (no bending, melting, shrinking or fading). The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
End: the clip settles exactly on the provided last frame and holds it.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, blocks moving, blocks fading or popping, new blocks. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

### career-r21 (removal)

- first_frame: `keyframes/career-s2.png` · last_frame: `keyframes/career-s1.png`
- 6 s · 16:9 · draft google/veo-3.1-lite 720p ($0.18) · final google/veo-3.1-fast 1080p ($0.6) · prompt revision 4
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0.35864,0.09564,0.64077,0.83953]`

| Time | Beat |
|---|---|
| 0–0.5 s | Hold: nothing moves. |
| 0.5–1.8 s | The hovering left hand lowers and grips the large square block at the left end of the plinth. |
| 1.8–3.8 s | It lifts the block (with the low step beside it) straight up and out through the top edge of the frame; the bare plinth and the halftone remain. |
| 3.8–5.4 s | The empty left hand comes back down into frame and hovers in exactly its first-frame position. |
| 5.4–6.0 s | Hold on the exact last frame. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same two carved marble hands and draped forearms over a long marble plinth with a small structure of geometric marble blocks; every hand has exactly five fingers.
Motion beats: 0–0.5 s: Hold: nothing moves. 0.5–1.8 s: The hovering left hand lowers and grips the large square block at the left end of the plinth. 1.8–3.8 s: It lifts the block (with the low step beside it) straight up and out through the top edge of the frame; the bare plinth and the halftone remain. 3.8–5.4 s: The empty left hand comes back down into frame and hovers in exactly its first-frame position. 5.4–6.0 s: Hold on the exact last frame.
Hard constraints: Only the left hand and large square block at the left end of the plinth (together with the low step attached to its left side) move. The large square block at the left end of the plinth (together with the low step attached to its left side) is carried away as one rigid object: it keeps its exact shape and size, does not rotate, and leaves through the top edge of the frame — it never fades, dissolves or vanishes in place. Every other block stays exactly where it is, with no shift or wobble, and no new block appears in its place. The right hand stays completely still. The forearms move only as the hand requires; the drapery does not move. The hand and forearm stay one continuous limb attached to the same sleeve the whole time: the hand leaves through the top edge with the block and comes back down along the same path — it never pops in, fades in or enters from another side. Nothing is left behind where the hand was: no empty sleeve, no hanging cloth, no second hand. The block is never brought back or set down again.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat warm off-white, no texture, gradient, vignette or colour drift.
Materials: everything carved stays warm-ivory marble with fine tan veining; blocks are the same speckled ivory stone and stay rigid (no bending, melting, shrinking or fading). The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
End: the clip settles exactly on the provided last frame and holds it.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, blocks moving, blocks fading or popping, new blocks. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

### career-idle-s4 (idle)

- first_frame: `keyframes/career-s4.png` · last_frame: `keyframes/career-s4.png`
- 4 s · 16:9 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4) · prompt revision 3
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0.35864,0.09564,0.64077,0.83953]`

| Time | Beat |
|---|---|
| 0–2.0 s | The hands breathe: the fingers relax and flex by a few millimetres. |
| 2.0–4.0 s | The fingers return to exactly their first-frame position. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same two carved marble hands and draped forearms over a long marble plinth with a small structure of geometric marble blocks; every hand has exactly five fingers.
Motion beats: 0–2.0 s: The hands breathe: the fingers relax and flex by a few millimetres. 2.0–4.0 s: The fingers return to exactly their first-frame position.
Hard constraints: Throughout, the left hand keeps its pinch on the top cube and the right fingertips rest on the low steps; the hands stay in place and only the fingers move, by a few millimetres at most. No block moves, lifts, rotates or wobbles at any time; nothing is added or removed. The wrists, forearms and drapery do not move.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat warm off-white, no texture, gradient, vignette or colour drift.
Materials: everything carved stays warm-ivory marble with fine tan veining; blocks are the same speckled ivory stone and stay rigid (no bending, melting, shrinking or fading). The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
Loop: the clip ends on a frame identical to its first frame.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, blocks moving, grabbing or lifting a block. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

### career-idle-s3 (idle)

- first_frame: `keyframes/career-s3.png` · last_frame: `keyframes/career-s3.png`
- 4 s · 16:9 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4) · prompt revision 3
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0.35864,0.09564,0.64077,0.83953]`

| Time | Beat |
|---|---|
| 0–2.0 s | The hands breathe: the fingers relax and flex by a few millimetres. |
| 2.0–4.0 s | The fingers return to exactly their first-frame position. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same two carved marble hands and draped forearms over a long marble plinth with a small structure of geometric marble blocks; every hand has exactly five fingers.
Motion beats: 0–2.0 s: The hands breathe: the fingers relax and flex by a few millimetres. 2.0–4.0 s: The fingers return to exactly their first-frame position.
Hard constraints: Throughout, the left hand hovers open above the bare square block and the right fingertips rest on the low steps; the hands stay in place and only the fingers move, by a few millimetres at most. No block moves, lifts, rotates or wobbles at any time; nothing is added or removed. The wrists, forearms and drapery do not move.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat warm off-white, no texture, gradient, vignette or colour drift.
Materials: everything carved stays warm-ivory marble with fine tan veining; blocks are the same speckled ivory stone and stay rigid (no bending, melting, shrinking or fading). The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
Loop: the clip ends on a frame identical to its first frame.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, blocks moving, grabbing or lifting a block. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

### career-idle-s2 (idle)

- first_frame: `keyframes/career-s2.png` · last_frame: `keyframes/career-s2.png`
- 4 s · 16:9 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4) · prompt revision 3
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0.35864,0.09564,0.64077,0.83953]`

| Time | Beat |
|---|---|
| 0–2.0 s | The hands breathe: the fingers relax and flex by a few millimetres. |
| 2.0–4.0 s | The fingers return to exactly their first-frame position. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same two carved marble hands and draped forearms over a long marble plinth with a small structure of geometric marble blocks; every hand has exactly five fingers.
Motion beats: 0–2.0 s: The hands breathe: the fingers relax and flex by a few millimetres. 2.0–4.0 s: The fingers return to exactly their first-frame position.
Hard constraints: Throughout, the left hand hovers open above the square block and the right fingertips rest on the low steps; the hands stay in place and only the fingers move, by a few millimetres at most. No block moves, lifts, rotates or wobbles at any time; nothing is added or removed. The wrists, forearms and drapery do not move.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat warm off-white, no texture, gradient, vignette or colour drift.
Materials: everything carved stays warm-ivory marble with fine tan veining; blocks are the same speckled ivory stone and stay rigid (no bending, melting, shrinking or fading). The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
Loop: the clip ends on a frame identical to its first frame.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, blocks moving, grabbing or lifting a block. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

### career-idle-s1 (idle)

- first_frame: `keyframes/career-s1.png` · last_frame: `keyframes/career-s1.png`
- 4 s · 16:9 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4) · prompt revision 3
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0.35864,0.09564,0.64077,0.83953]`

| Time | Beat |
|---|---|
| 0–2.0 s | The hands breathe: the fingers relax and flex by a few millimetres. |
| 2.0–4.0 s | The fingers return to exactly their first-frame position. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same two carved marble hands and draped forearms over a long marble plinth with a small structure of geometric marble blocks; every hand has exactly five fingers.
Motion beats: 0–2.0 s: The hands breathe: the fingers relax and flex by a few millimetres. 2.0–4.0 s: The fingers return to exactly their first-frame position.
Hard constraints: Throughout, the left hand hovers open above the empty left end of the plinth and the right fingertips rest on the low steps; the hands stay in place and only the fingers move, by a few millimetres at most. No block moves, lifts, rotates or wobbles at any time; nothing is added or removed. The wrists, forearms and drapery do not move.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat warm off-white, no texture, gradient, vignette or colour drift.
Materials: everything carved stays warm-ivory marble with fine tan veining; blocks are the same speckled ivory stone and stay rigid (no bending, melting, shrinking or fading). The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
Loop: the clip ends on a frame identical to its first frame.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, blocks moving, grabbing or lifting a block. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

---

## products-reader — Selected products (desktop, 16:9)

- **Trigger:** Autoplay muted loop while the product frame is in view.
- **Loop method:** single clip, first = last = master. Reading and blinking are driven by the prompt. No eye-region keyframe: every image edit of this head re-rendered it at a different scale/position (round 1), so a small composited eye patch could not line up faithfully; the master is both ends of the loop.
- **Composition on the page:** Crop with pageCropNormalized (full master), key the #ad6b51 ground like projects-frame, keep the #141413 opening opaque; the real AI Hiring Chat screenshot is composited in HTML above the opening, so the screen interior in the video must stay flat dark.

### products-reader-loop

- first_frame: `keyframes/products-reader-master.png` · last_frame: `keyframes/products-reader-master.png`
- 6 s · 16:9 · draft google/veo-3.1-lite 720p ($0.18) · final google/veo-3.1-fast 1080p ($0.6) · prompt revision 3
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0.07802,0,0.84396,1]`

| Time | Beat |
|---|---|
| 0–0.3 s | Still, gaze resting at the top-left of the screen. |
| 0.3–1.5 s | Reading line 1: the eyes track left → right across the screen in three small saccades. |
| 1.5–1.8 s | Blink #1: the eyelids close and reopen naturally. |
| 1.8–2.2 s | Return sweep: the eyes jump back to the left and drop one line. |
| 2.2–3.4 s | Reading line 2: three small left → right saccades. |
| 3.4–3.8 s | Return sweep, dropping another line. |
| 3.8–4.8 s | Reading line 3: three small saccades. |
| 4.8–5.1 s | Blink #2. |
| 5.1–6.0 s | The gaze returns to the top-left of the screen — the exact first frame. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same classical marble head in right-facing profile on the left, merging into a broken carved stone frame around a flat near-black screen opening; same face, curls and cracks at every moment. The carved eyes have eyelids that can close; the eyes themselves stay carved stone.
Motion beats: 0–0.3 s: Still, gaze resting at the top-left of the screen. 0.3–1.5 s: Reading line 1: the eyes track left → right across the screen in three small saccades. 1.5–1.8 s: Blink #1: the eyelids close and reopen naturally. 1.8–2.2 s: Return sweep: the eyes jump back to the left and drop one line. 2.2–3.4 s: Reading line 2: three small left → right saccades. 3.4–3.8 s: Return sweep, dropping another line. 3.8–4.8 s: Reading line 3: three small saccades. 4.8–5.1 s: Blink #2. 5.1–6.0 s: The gaze returns to the top-left of the screen — the exact first frame.
Hard constraints: Only the eyes and eyelids move. The head stays nearly still — at most a 1° drift that returns — with no nod, no chin lift and no turn toward the viewer; the gaze stays on the screen. The curls, cracks and the whole stone frame never move. The screen opening stays uniformly flat near-black: no text, no light, no reflection, nothing appears on it.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat terracotta, no texture, gradient, vignette or colour drift.
Materials: everything carved stays warm-ivory marble with fine tan veining; the eyes stay carved stone; the frame stays the same cracked stone. The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
Loop: the clip ends on a frame identical to its first frame.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, anything on the screen, head turning. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

---

## beyond-book — Beyond work — Daily Reading (desktop, 16:9)

- **Trigger:** Autoplay when the reading card is in view: play A+B (10 s), hold the still for 6 s, repeat. Paused offscreen.
- **Loop method:** peak. A (master→page mid-turn) + B (page lands, sheets settle → master). The hold between cycles keeps the card calm.
- **Composition on the page:** Crop with pageCropNormalized, key the #f1e8de ground and apply the same left 460 px halftone fade as beyond-reading.

### beyond-book-A

- first_frame: `keyframes/beyond-book-master.png` · last_frame: `keyframes/beyond-book-peak.png`
- 4 s · 16:9 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4) · prompt revision 4
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0.15604,0,0.84396,1]`

| Time | Beat |
|---|---|
| 0–0.8 s | Still. |
| 0.8–2.4 s | A single page at the right page block lifts at its corner, as if caught by a light breeze. |
| 2.4–4.0 s | It rises and curls over into a soft standing arc leaning left, catching light on its edge — the exact last frame. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same large open antique book on a carved marble column capital, with loose engraved sheets (a Colosseum engraving, a landscape engraving, ruled sheets) standing behind it.
Motion beats: 0–0.8 s: Still. 0.8–2.4 s: A single page at the right page block lifts at its corner, as if caught by a light breeze. 2.4–4.0 s: It rises and curls over into a soft standing arc leaning left, catching light on its edge — the exact last frame.
Hard constraints: Only ONE page turns; it stays a single sheet of paper with the same size. The book block, spine, cover and column capital never move. The loose sheets behind move only as described, by a few millimetres, and stay in their places with the same pictures. No new pages, no writing appears on any page. In this clip the loose sheets do not move at all. The page lifts and curls in one continuous motion with no back-and-forth; the other pages do not flutter. The empty background around the book never gains new halftone squares.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat warm cream, no texture, gradient, vignette or colour drift; the empty left margin stays empty.
Materials: everything carved stays warm-ivory marble with fine tan veining; paper stays warm cream paper; the engravings keep exactly the same pictures and never redraw. The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
End: the clip settles exactly on the provided last frame and holds it.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, several pages flipping. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

### beyond-book-B

- first_frame: `keyframes/beyond-book-peak.png` · last_frame: `keyframes/beyond-book-master.png`
- 4 s · 16:9 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4) · prompt revision 4
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0.15604,0,0.84396,1]`

| Time | Beat |
|---|---|
| 0–1.6 s | The arched page continues over to the left and lays down onto the fanned left pages. |
| 1.6–2.8 s | The air from the page makes the loose sheets behind tremble slightly; the ruled sheet lifts a few millimetres at its corner. |
| 2.8–4.0 s | Everything settles to the exact last frame. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same large open antique book on a carved marble column capital, with loose engraved sheets (a Colosseum engraving, a landscape engraving, ruled sheets) standing behind it.
Motion beats: 0–1.6 s: The arched page continues over to the left and lays down onto the fanned left pages. 1.6–2.8 s: The air from the page makes the loose sheets behind tremble slightly; the ruled sheet lifts a few millimetres at its corner. 2.8–4.0 s: Everything settles to the exact last frame.
Hard constraints: Only ONE page turns; it stays a single sheet of paper with the same size. The book block, spine, cover and column capital never move. The loose sheets behind move only as described, by a few millimetres, and stay in their places with the same pictures. No new pages, no writing appears on any page. Only the one arched page travels until it lies flat; no other page flips. The loose sheets tremble in place by a few millimetres — no sheet lifts off, flies, slides or leaves the frame, and the engravings never fade or change. The empty background around the book never gains new halftone squares.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat warm cream, no texture, gradient, vignette or colour drift; the empty left margin stays empty.
Materials: everything carved stays warm-ivory marble with fine tan veining; paper stays warm cream paper; the engravings keep exactly the same pictures and never redraw. The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
End: the clip settles exactly on the provided last frame and holds it.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, several pages flipping. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

---

## beyond-knob — Beyond work — Music (desktop, 16:9)

- **Trigger:** Plays only while a song is playing (bind to the audio element's play/pause). Clips A → B → C loop (12 s). On pause, finish the current clip at 2× and hold its last frame (every clip ends on a valid rest pose); resume with the next clip.
- **Loop method:** three-step full turn: n0 → n120 → n240 → n0 (each clip +120°). The knob now carries an engraved indicator notch, so rotation reads against the fixed tick ring. Each clip turns the knob +120° in two 60° twists with a finger re-grip in between, ending with the hand back in its home grip; after three clips the notch has completed a full turn, so C ends on the n0 frame and the loop is seamless and feels like continuous scrolling.
- **Composition on the page:** Uses the CURRENT page master (the 536×215 strip from commit 4e2fb82), upscaled 3× for Veo. The 16:9 canvas repeats the strip's edge rows top and bottom; crop back with pageCropNormalized and downscale to 536×215 (opaque card ground with the existing edge fades).

### beyond-knob-A

- first_frame: `keyframes/beyond-knob-n0.png` · last_frame: `keyframes/beyond-knob-n120.png`
- 4 s · 16:9 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4) · prompt revision 3
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0,0.14365,1,0.71271]`

| Time | Beat |
|---|---|
| 0–0.3 s | Thumb and index finger tighten their pinch on the knob rim. |
| 0.3–1.7 s | They twist the knob 60° clockwise, the wrist rolling slightly; the notch moves from 1:30 to 3:30. |
| 1.7–2.2 s | The fingers release and slide back to their home grip; the knob stays where it was turned. |
| 2.2–3.6 s | A second 60° clockwise twist brings the notch to 5:30. |
| 3.6–4.0 s | Fingers release back to the home grip — the exact last frame. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same carved marble hand reaching from the left across a halftone dissolve and a deep red circle, thumb and index finger pinching a brushed-metal knob with an engraved indicator notch, set in a dark ring with small tick marks on a dark panel; the hand has exactly five fingers.
Motion beats: 0–0.3 s: Thumb and index finger tighten their pinch on the knob rim. 0.3–1.7 s: They twist the knob 60° clockwise, the wrist rolling slightly; the notch moves from 1:30 to 3:30. 1.7–2.2 s: The fingers release and slide back to their home grip; the knob stays where it was turned. 2.2–3.6 s: A second 60° clockwise twist brings the notch to 5:30. 3.6–4.0 s: Fingers release back to the home grip — the exact last frame.
Hard constraints: The knob turns only clockwise and only about its own centre; the engraved notch stays clearly visible as one thin dark line the whole time (it never smears, doubles or disappears). The tick ring, the dark panel and the red circle never rotate or move. The knob does not change size or position. The thumb and index finger stay on the knob rim; the palm, wrist and forearm move only slightly; the other fingers stay curled where they are.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: the provided strip colours stay perfectly flat (cream left, deep red circle, near-black panel right); the repeated rows above and below the strip are static padding and never move.
Materials: everything carved stays warm-ivory marble with fine tan veining; the knob stays brushed metal with the same size and position; the brushed highlight stays fixed to the light while the knob turns. The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
End: the clip settles exactly on the provided last frame and holds it.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, tick ring rotating, extra notches or lines. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

### beyond-knob-B

- first_frame: `keyframes/beyond-knob-n120.png` · last_frame: `keyframes/beyond-knob-n240.png`
- 4 s · 16:9 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4) · prompt revision 3
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0,0.14365,1,0.71271]`

| Time | Beat |
|---|---|
| 0–0.3 s | Thumb and index finger tighten their pinch on the knob rim. |
| 0.3–1.7 s | They twist the knob 60° clockwise, the wrist rolling slightly; the notch moves from 5:30 to 7:30. |
| 1.7–2.2 s | The fingers release and slide back to their home grip; the knob stays where it was turned. |
| 2.2–3.6 s | A second 60° clockwise twist brings the notch to 9:30. |
| 3.6–4.0 s | Fingers release back to the home grip — the exact last frame. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same carved marble hand reaching from the left across a halftone dissolve and a deep red circle, thumb and index finger pinching a brushed-metal knob with an engraved indicator notch, set in a dark ring with small tick marks on a dark panel; the hand has exactly five fingers.
Motion beats: 0–0.3 s: Thumb and index finger tighten their pinch on the knob rim. 0.3–1.7 s: They twist the knob 60° clockwise, the wrist rolling slightly; the notch moves from 5:30 to 7:30. 1.7–2.2 s: The fingers release and slide back to their home grip; the knob stays where it was turned. 2.2–3.6 s: A second 60° clockwise twist brings the notch to 9:30. 3.6–4.0 s: Fingers release back to the home grip — the exact last frame.
Hard constraints: The knob turns only clockwise and only about its own centre; the engraved notch stays clearly visible as one thin dark line the whole time (it never smears, doubles or disappears). The tick ring, the dark panel and the red circle never rotate or move. The knob does not change size or position. The thumb and index finger stay on the knob rim; the palm, wrist and forearm move only slightly; the other fingers stay curled where they are.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: the provided strip colours stay perfectly flat (cream left, deep red circle, near-black panel right); the repeated rows above and below the strip are static padding and never move.
Materials: everything carved stays warm-ivory marble with fine tan veining; the knob stays brushed metal with the same size and position; the brushed highlight stays fixed to the light while the knob turns. The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
End: the clip settles exactly on the provided last frame and holds it.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, tick ring rotating, extra notches or lines. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

### beyond-knob-C

- first_frame: `keyframes/beyond-knob-n240.png` · last_frame: `keyframes/beyond-knob-n0.png`
- 4 s · 16:9 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4) · prompt revision 3
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0,0.14365,1,0.71271]`

| Time | Beat |
|---|---|
| 0–0.3 s | Thumb and index finger tighten their pinch on the knob rim. |
| 0.3–1.7 s | They twist the knob 60° clockwise, the wrist rolling slightly; the notch moves from 9:30 to 11:30. |
| 1.7–2.2 s | The fingers release and slide back to their home grip; the knob stays where it was turned. |
| 2.2–3.6 s | A second 60° clockwise twist brings the notch to 1:30. |
| 3.6–4.0 s | Fingers release back to the home grip — the exact last frame. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same carved marble hand reaching from the left across a halftone dissolve and a deep red circle, thumb and index finger pinching a brushed-metal knob with an engraved indicator notch, set in a dark ring with small tick marks on a dark panel; the hand has exactly five fingers.
Motion beats: 0–0.3 s: Thumb and index finger tighten their pinch on the knob rim. 0.3–1.7 s: They twist the knob 60° clockwise, the wrist rolling slightly; the notch moves from 9:30 to 11:30. 1.7–2.2 s: The fingers release and slide back to their home grip; the knob stays where it was turned. 2.2–3.6 s: A second 60° clockwise twist brings the notch to 1:30. 3.6–4.0 s: Fingers release back to the home grip — the exact last frame.
Hard constraints: The knob turns only clockwise and only about its own centre; the engraved notch stays clearly visible as one thin dark line the whole time (it never smears, doubles or disappears). The tick ring, the dark panel and the red circle never rotate or move. The knob does not change size or position. The thumb and index finger stay on the knob rim; the palm, wrist and forearm move only slightly; the other fingers stay curled where they are.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: the provided strip colours stay perfectly flat (cream left, deep red circle, near-black panel right); the repeated rows above and below the strip are static padding and never move.
Materials: everything carved stays warm-ivory marble with fine tan veining; the knob stays brushed metal with the same size and position; the brushed highlight stays fixed to the light while the knob turns. The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
End: the clip settles exactly on the provided last frame and holds it.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, tick ring rotating, extra notches or lines. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

---

## jj-desktop — JJ (desktop, 16:9)

- **Trigger:** Not tied to JJ on/off. When the JJ section first enters view, play "listen" once (hand comes up to the ear), then loop "idle" while in view. Reduced motion / Save-Data: the master still only.
- **Loop method:** listen (START → master, once) + single-clip idle loop (first = last = master). START has the hand lowered out of frame with the ear and curls rebuilt (edit composited only in the arm/ear region; the face stays the master's pixels). The speaking variant from round 1 is dropped.
- **Composition on the page:** Crop with pageCropNormalized and key the #591210 ground like jj-listener; the CSS disc stays behind. Use the START still as the poster before the section enters view, so the first frame matches.

### jj-listen-desktop (intro (once))

- first_frame: `keyframes/jj-desktop-start.png` · last_frame: `keyframes/jj-desktop-master.png`
- 4 s · 16:9 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4) · prompt revision 3
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0.07802,0,0.84396,1]`

| Time | Beat |
|---|---|
| 0–0.4 s | Still: head bowed, listening; no hand near the head. |
| 0.4–2.6 s | His right hand rises from below the bottom edge of the frame, the forearm bending at the elbow, up past the shoulder and the brooch. |
| 2.6–3.5 s | The hand cups behind his ear, fingers settling gently onto the curls. |
| 3.5–4.0 s | Settles exactly into the last frame and holds. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same classical marble bust of a young man with tight carved curls, bronze brooch on the shoulder — same face and proportions as the first frame at every moment; carved statue eyes (no pupils, no blinking).
Motion beats: 0–0.4 s: Still: head bowed, listening; no hand near the head. 0.4–2.6 s: His right hand rises from below the bottom edge of the frame, the forearm bending at the elbow, up past the shoulder and the brooch. 2.6–3.5 s: The hand cups behind his ear, fingers settling gently onto the curls. 3.5–4.0 s: Settles exactly into the last frame and holds.
Hard constraints: Only the right arm and hand move; it is ONE hand with exactly five fingers, entering from the bottom edge. The head stays bowed in the same pose (within about 3°): no chin lift, no turn toward the viewer; the face, curls and ear keep their shape. The shoulders, drapery and brooch do not move.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat deep oxblood red, no texture, gradient, vignette or colour drift.
Materials: everything carved stays warm-ivory marble with fine tan veining; the brooch stays bronze. The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
End: the clip settles exactly on the provided last frame and holds it.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, a second hand, head lifting. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

### jj-idle-desktop (loop)

- first_frame: `keyframes/jj-desktop-master.png` · last_frame: `keyframes/jj-desktop-master.png`
- 4 s · 16:9 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4) · prompt revision 4
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0.07802,0,0.84396,1]`

| Time | Beat |
|---|---|
| 0–2.0 s | A slow, gentle sway: the head (with the hand at the ear) leans about 1.5° to his right with a barely visible nod, like softly listening to music; the shoulders breathe slightly. |
| 2.0–4.0 s | Sways back and returns exactly to the first-frame pose. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same classical marble bust of a young man with tight carved curls, bronze brooch on the shoulder — same face and proportions as the first frame at every moment; carved statue eyes (no pupils, no blinking).
Motion beats: 0–2.0 s: A slow, gentle sway: the head (with the hand at the ear) leans about 1.5° to his right with a barely visible nod, like softly listening to music; the shoulders breathe slightly. 2.0–4.0 s: Sways back and returns exactly to the first-frame pose.
Hard constraints: The hand stays cupped behind the ear, touching the curls, for the entire clip — it never lifts away or gestures. The head stays bowed: head movement stays within about 3° of the first frame, no chin lift and no upward glance at any point, never toward the viewer. The face, curls, brooch and drapery keep their shape. The sway is gentle but clearly visible. There is no text, no numbers and no writing anywhere in the frame.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat deep oxblood red, no texture, gradient, vignette or colour drift.
Materials: everything carved stays warm-ivory marble with fine tan veining; the brooch stays bronze. The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
Loop: the clip ends on a frame identical to its first frame.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, hand leaving the ear, head lifting. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

---

## jj-mobile — JJ (mobile, 9:16)

- **Trigger:** Not tied to JJ on/off. When the JJ section first enters view, play "listen" once (hand comes up to the ear), then loop "idle" while in view. Reduced motion / Save-Data: the master still only.
- **Loop method:** listen (START → master, once) + single-clip idle loop (first = last = master). START has the hand lowered out of frame with the ear and curls rebuilt (edit composited only in the arm/ear region; the face stays the master's pixels). The speaking variant from round 1 is dropped.
- **Composition on the page:** Crop with pageCropNormalized and key the #521614 ground like jj-listener-mobile; the CSS disc stays behind. Use the START still as the poster before the section enters view, so the first frame matches.

### jj-listen-mobile (intro (once))

- first_frame: `keyframes/jj-mobile-start.png` · last_frame: `keyframes/jj-mobile-master.png`
- 4 s · 9:16 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4) · prompt revision 3
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0,0.29724,1,0.70276]`

| Time | Beat |
|---|---|
| 0–0.4 s | Still: head bowed, listening; no hand near the head. |
| 0.4–2.6 s | His right hand rises from below the bottom edge of the frame, the forearm bending at the elbow, up past the shoulder and the brooch. |
| 2.6–3.5 s | The hand cups behind his ear, fingers settling gently onto the curls. |
| 3.5–4.0 s | Settles exactly into the last frame and holds. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same classical marble bust of a young man with tight carved curls, bronze brooch on the shoulder — same face and proportions as the first frame at every moment; carved statue eyes (no pupils, no blinking).
Motion beats: 0–0.4 s: Still: head bowed, listening; no hand near the head. 0.4–2.6 s: His right hand rises from below the bottom edge of the frame, the forearm bending at the elbow, up past the shoulder and the brooch. 2.6–3.5 s: The hand cups behind his ear, fingers settling gently onto the curls. 3.5–4.0 s: Settles exactly into the last frame and holds.
Hard constraints: Only the right arm and hand move; it is ONE hand with exactly five fingers, entering from the bottom edge. The head stays bowed in the same pose (within about 3°): no chin lift, no turn toward the viewer; the face, curls and ear keep their shape. The shoulders, drapery and brooch do not move.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat deep oxblood red, no texture, gradient, vignette or colour drift.
Materials: everything carved stays warm-ivory marble with fine tan veining; the brooch stays bronze. The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
End: the clip settles exactly on the provided last frame and holds it.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, a second hand, head lifting. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

### jj-idle-mobile (loop)

- first_frame: `keyframes/jj-mobile-master.png` · last_frame: `keyframes/jj-mobile-master.png`
- 4 s · 9:16 · draft google/veo-3.1-lite 720p ($0.12) · final google/veo-3.1-fast 1080p ($0.4) · prompt revision 3
- Crop back to page aspect (x, y, w, h as fractions of the output): `[0,0.29724,1,0.70276]`

| Time | Beat |
|---|---|
| 0–2.0 s | A slow, gentle sway: the head (with the hand at the ear) leans about 1.5° to his right with a barely visible nod, like softly listening to music; the shoulders breathe slightly. |
| 2.0–4.0 s | Sways back and returns exactly to the first-frame pose. |

**Prompt**

```text
Animate this exact illustration; the first and last frames are provided and must be matched exactly. Subject continuity: the same classical marble bust of a young man with tight carved curls, bronze brooch on the shoulder — same face and proportions as the first frame at every moment; carved statue eyes (no pupils, no blinking).
Motion beats: 0–2.0 s: A slow, gentle sway: the head (with the hand at the ear) leans about 1.5° to his right with a barely visible nod, like softly listening to music; the shoulders breathe slightly. 2.0–4.0 s: Sways back and returns exactly to the first-frame pose.
Hard constraints: The hand stays cupped behind the ear, touching the curls, for the entire clip — it never lifts away or gestures. The head stays bowed: head movement stays within about 3° of the first frame, no chin lift and no upward glance at any point, never toward the viewer. The face, curls, brooch and drapery keep their shape.
Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake; framing and scale identical to the provided frames.
Lighting continuity: the same soft key light from the upper left; no flicker, no exposure change.
Background: perfectly flat deep oxblood red, no texture, gradient, vignette or colour drift.
Materials: everything carved stays warm-ivory marble with fine tan veining; the brooch stays bronze. The square-dot halftone pattern is a fixed printed texture: every square stays exactly in place and at the same density — it does not fade, flicker, crawl or disappear.
Loop: the clip ends on a frame identical to its first frame.
Avoid: text, letters, logos, watermark, new objects, extra hands or fingers, deformed hands, identity change, camera motion, background change, halftone changes, morphing, cuts, hand leaving the ear, head lifting. Silent.
```

**Negative prompt:** not sent separately (the API ignores it); the Avoid list is in the prompt.

---

## footer-hand — Closing footer (all, page (1:1))

- **Trigger:** Once, when the footer is ≥35 % in view (IntersectionObserver).
- **Loop method:** none — CSS/Framer Motion transform, no generation. Start: the hand translated right by 49.4 % and down by 5.6 % of the art box (620, 70 px at 1254) — only the fingertips show at the circle edge; End: the approved position. 900 ms, ease "easeOut"; opacity 0→1 over the first 300 ms. The section clips overflow. Reduced motion: render the end position with no transform.
- **Composition on the page:** Uses the existing footer-hand export; start/end frames here are composited from it with sharp purely to preview the motion.
- **Frames:** `keyframes/footer-hand-start.png` → `keyframes/footer-hand-end.png`
