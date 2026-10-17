# Roman v2 — Codex image prompts

Run each from the repo root. One image per run. Every prompt asks Codex to save the PNG to
`design/roman-v2/assets/masters/<id>.png` — that exact filename is what
`scripts/prepare-roman-v2-assets.mjs` picks up in place of the interim concept crop.

After saving masters, run:

```bash
node scripts/prepare-roman-v2-assets.mjs
```

Priority: 1 → 11. Items 1–2 are the only ones that need the identity photo.

Shared rules baked into every prompt: the concept image is a style/composition reference only; no text, letters,
numbers, UI, buttons, cards, chart lines, cursors or watermarks; one single image, not a collage; flat plain background
in the exact hex given (the export script feathers edges into it); left side kept empty where HTML copy will sit.

---

## 1. `hero-figure` (desktop, landscape 3:2)

```bash
codex exec --skip-git-repo-check -i design/roman-v2/concepts/01-hero-approved.png -i design/roman-v2/source-media/rakshit-identity-reference.jpg "Use your built-in image generation tool (not code) to create ONE landscape 3:2 image, then save the PNG to design/roman-v2/assets/masters/hero-figure.png and print the path. Image 1 is a STYLE AND COMPOSITION reference only; image 2 is the identity reference. Subject: the man from image 2 rendered as a carved Roman marble statue, seated, wearing a draped marble toga with a small round carved brooch on the left shoulder, working on a matte-black modern laptop resting on his lap. Preserve his identity exactly: facial structure, wavy voluminous hair carved in marble, and thin rectangular glasses (rendered in marble-tone metal). Head, gaze, torso, forearms, hands, keyboard and laptop ALL face LEFT (toward the left edge of the frame). Warm ivory marble with fine veining, soft daylight from upper left, finely carved drapery. A restrained square-dot halftone dissolve in warm brown spreads from the laptop's left edge and his left side outward into the background, like the reference. Figure occupies the right 65% of the frame, cropped at mid-thigh/bench at the bottom edge, head about 12% from the top. The left 35% is empty. Background: perfectly flat plain #F4EBDF with no texture, no circles, no shadows on the background. Absolutely NO text, letters, numbers, logos, UI, buttons, navigation, borders or watermark. One single image, not a collage."
```

## 2. `hero-figure-mobile` (mobile, portrait ~8:7)

```bash
codex exec --skip-git-repo-check -i design/roman-v2/concepts/01-hero-approved.png -i design/roman-v2/source-media/rakshit-identity-reference.jpg "Use your built-in image generation tool (not code) to create ONE square 1:1 image, then save the PNG to design/roman-v2/assets/masters/hero-figure-mobile.png and print the path. Image 1 is a STYLE reference only; image 2 is the identity reference. Same subject as a desktop hero: the man from image 2 as a carved Roman marble statue in a draped toga with a round shoulder brooch, typing on a matte-black laptop on his lap; preserve facial structure, wavy marble hair and thin rectangular glasses. Head, torso, hands and laptop face LEFT. Composed for a phone: figure centred slightly right, from head to waist, head near the top with 8% margin, laptop fully visible at lower left. Restrained warm-brown square-dot halftone dissolving off the laptop's left edge. Background: perfectly flat plain #F4EBDF. Absolutely NO text, letters, numbers, UI, buttons, borders or watermark. One single image."
```

## 3. `career-hands` (landscape ~2.3:1 → ask 16:9)

```bash
codex exec --skip-git-repo-check -i design/roman-v2/concepts/02-work-over-time-approved.png "Use your built-in image generation tool (not code) to create ONE landscape 16:9 image, then save the PNG to design/roman-v2/assets/masters/career-hands.png and print the path. The attached image is a STYLE reference only. Subject: a Roman marble bas-relief of two carved hands entering from the right and top-right, carefully assembling simple geometric stone blocks (cubes, a half-arch, a cylinder, a sphere, stepped blocks) into a small structure, like building a product. Warm ivory travertine, soft daylight from upper left, crisp carving. A restrained warm-grey square-dot halftone dissolves the left edge of the composition. The artwork occupies the right 70% of the frame and is vertically centred; the left 30% is empty. Background: perfectly flat plain #F6EFE5. Absolutely NO text, letters, numbers, chart lines, graph nodes, grids, UI, cards, buttons or watermark. No full human figure or face. One single image."
```

## 4. `projects-frame` (landscape ~1.6:1 → ask 3:2)

```bash
codex exec --skip-git-repo-check -i design/roman-v2/concepts/03-selected-products-approved.png "Use your built-in image generation tool (not code) to create ONE landscape 3:2 image, then save the PNG to design/roman-v2/assets/masters/projects-frame.png and print the path. The attached image is a STYLE reference only. Subject: a weathered, broken Roman marble picture frame (like a fragment of an ancient stone window) seen nearly head-on, slightly tilted, with a classical marble sculpture head (curly hair, profile facing right) emerging from and overlapping its left edge. The frame's inner opening is a clean rectangle occupying roughly x 30%–84%, y 14%–82% of the image and is filled with perfectly flat solid #141413 (no screen content, no reflections, no UI). Chipped edges, warm ivory marble, a restrained square-dot halftone in darker terracotta scattering off the lower-left. Background: perfectly flat plain #B26E58 terracotta. Absolutely NO text, letters, numbers, interface, chat bubbles, buttons or watermark. One single image."
```

## 5. `projects-head` (portrait ~1:1.8 → ask 2:3)

```bash
codex exec --skip-git-repo-check -i design/roman-v2/concepts/03-selected-products-approved.png "Use your built-in image generation tool (not code) to create ONE portrait 2:3 image, then save the PNG to design/roman-v2/assets/masters/projects-head.png and print the path. The attached image is a STYLE reference only. Subject: a classical Roman marble sculpture head and neck with curly carved hair, three-quarter profile facing right, the lower neck broken off and dissolving downward into a restrained square-dot halftone in deep terracotta. Warm ivory marble, soft light from upper left. Centred, occupying 80% of the height. Background: perfectly flat plain #B26E58. Absolutely NO text, letters, numbers, UI, frame, buttons or watermark. One single image."
```

## 6. `beyond-reading` (landscape ~1.4:1 → ask 3:2)

```bash
codex exec --skip-git-repo-check -i design/roman-v2/concepts/04-beyond-work-approved.png "Use your built-in image generation tool (not code) to create ONE landscape 3:2 image, then save the PNG to design/roman-v2/assets/masters/beyond-reading.png and print the path. The attached image is a STYLE reference only. Subject: an open antique book resting on a carved Roman marble plinth, with a loose collage of aged paper sheets fanned behind it: a sepia engraving of the Colosseum, a sepia landscape engraving, and plain cream sheets. Pages show only blank paper or very faint illegible ruled grey lines — no readable writing. Warm ivory and sepia palette, soft daylight from upper left, a restrained square-dot halftone dissolving off the left edge. Composition fills the right 75%; the left 25% is empty. Background: perfectly flat plain #F2EAE0. Absolutely NO readable text, letters, numbers, UI, buttons or watermark. One single image."
```

## 7. `beyond-music` (wide ~2.5:1 → ask 16:9)

```bash
codex exec --skip-git-repo-check -i design/roman-v2/concepts/04-beyond-work-approved.png "Use your built-in image generation tool (not code) to create ONE landscape 16:9 image, then save the PNG to design/roman-v2/assets/masters/beyond-music.png and print the path. The attached image is a STYLE reference only. Subject: a carved Roman marble hand and forearm entering from the left, fingertips turning a single modern brushed-black aluminium rotary audio knob with fine knurling, shown in close-up. The knob sits at the right third, the hand spans the left two thirds, vertically centred, occupying the middle 60% of the height. Behind the hand, a large soft circle of deep oxblood #662823. Warm ivory marble, soft light. Background elsewhere: perfectly flat plain #F2EAE0. Absolutely NO text, letters, numbers, waveforms, screens, UI, buttons or watermark. One single image."
```

## 8. `beyond-column` (wide ~3:1 → ask 16:9)

```bash
codex exec --skip-git-repo-check -i design/roman-v2/concepts/04-beyond-work-approved.png "Use your built-in image generation tool (not code) to create ONE landscape 16:9 image, then save the PNG to design/roman-v2/assets/masters/beyond-column.png and print the path. The attached image is a STYLE reference only. Subject: a decorative architectural fragment: the upper part of a fluted Ionic Roman marble column with its capital at the far right, a sprig of dark green olive leaves crossing in front of it at upper centre-right, and a restrained warm-grey square-dot halftone dissolving leftward. Everything sits in the right 55%; the left 45% is empty. Soft daylight. Background: perfectly flat plain #C0BFAE sage. Absolutely NO text, letters, numbers, UI or watermark. One single image."
```

## 9. `jj-listener` (desktop, landscape ~1.45:1 → ask 3:2)

```bash
codex exec --skip-git-repo-check -i design/roman-v2/concepts/05-jj-approved.png "Use your built-in image generation tool (not code) to create ONE landscape 3:2 image, then save the PNG to design/roman-v2/assets/masters/jj-listener.png and print the path. The attached image is a STYLE reference only. Subject: a classical Roman marble bust of a young man with curly hair in three-quarter view facing LEFT, one hand raised and cupped behind his ear as if listening attentively, a draped toga with a small round brooch on the shoulder. Warm ivory marble lit softly from the left against darkness. A restrained square-dot halftone in muted rose and dark red dissolves the left side of the bust into the background. Bust occupies the centre-right 55%, cropped at the chest by the bottom edge; leave the right 15% and left 30% empty (a voice orb will be placed at the right by code). Background: perfectly flat plain deep oxblood #4F1816. Absolutely NO text, letters, numbers, orb, microphone, UI, buttons or watermark. One single image."
```

## 10. `jj-listener-mobile` (portrait ~4:5)

```bash
codex exec --skip-git-repo-check -i design/roman-v2/concepts/05-jj-approved.png "Use your built-in image generation tool (not code) to create ONE portrait 4:5 image, then save the PNG to design/roman-v2/assets/masters/jj-listener-mobile.png and print the path. The attached image is a STYLE reference only. Subject: the same classical Roman marble listening bust — young man, curly hair, three-quarter view facing LEFT, hand cupped behind the ear, toga with round brooch — composed for a phone: head and shoulders centred, head near the top with 8% margin, cropped at mid-chest. Restrained rose/dark-red square-dot halftone dissolving the lower-left. Background: perfectly flat plain #4F1816. Absolutely NO text, letters, numbers, orb, UI or watermark. One single image."
```

## 11. `footer-hand` (portrait ~0.9:1 → ask 1:1)

```bash
codex exec --skip-git-repo-check -i design/roman-v2/concepts/06-footer-approved.png "Use your built-in image generation tool (not code) to create ONE square 1:1 image, then save the PNG to design/roman-v2/assets/masters/footer-hand.png and print the path. The attached image is a STYLE reference only. Subject: a carved Roman marble hand and forearm reaching in from the upper right toward the lower left, index finger extended as if about to touch something (in the spirit of the Creation of Adam), wrist wrapped in carved drapery. Warm ivory marble, soft light from upper left. A restrained warm-grey square-dot halftone dissolves the forearm toward the right and top edges. The fingertip sits about 25% from the left and 60% from the top; the left 20% is empty. Background: perfectly flat plain #E5D9CC. Absolutely NO text, letters, numbers, cursor, arrow, UI or watermark. One single image."
```

---

Not generated (fine as concept crops or CSS): `beyond-whoop-fragment`, `writing-thumb-*`, texture tile, JJ orb, hero/footer circles.

Note: generated masters will have different pixel dimensions from the interim crops. After running the script,
the coordinator updates component `width`/`height`/`sizes` to the new manifest values.
