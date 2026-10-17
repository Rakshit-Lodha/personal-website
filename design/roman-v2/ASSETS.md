# Roman v2 runtime artwork (interim)

**Status of every asset: interim – derived from approved concept; replace with regenerated art.**

Every layer was cut out of the approved concept PNGs in `concepts/` by `scripts/prepare-roman-v2-assets.mjs`. Text, nav, buttons, metrics, chart lines and fake UI were removed with tight crops, feathered alpha erasure (hidden RGB scrubbed too), flat paint-overs or small inpaints. No image generation was used in this pass. The identity reference photo is **not** copied to `public/`.

- Re-run: `node scripts/prepare-roman-v2-assets.mjs` (add `--preview <dir>` for flattened PNG previews).
- Regenerated art: put a PNG at `design/roman-v2/assets/masters/<id>.png` and re-run. The script uses it instead of the concept crop and applies only the edge fades.
- Machine-readable manifest: [`assets/manifest.json`](assets/manifest.json). It lists the files, byte sizes, crop rectangles, cleanup ops and the projects window polygon.
- All images are decorative: `alt=""` and `aria-hidden`. Use `<picture>` with AVIF first and WebP as the fallback. Lazy-load everything except the hero.
- Alpha layers fade to **transparent** on the listed sides. They are tuned to sit on the listed background hex.

## Assets

| id | files (`public/roman-v2/…`) | px (w×h) | placement | fades → over bg | source crop (concept px: x,y,w,h) |
| --- | --- | --- | --- | --- | --- |
| hero-figure | `hero/hero-figure-{720,1105}.{avif,webp}` | 720×487, 1105×748 | Desktop hero: right ~60%, bottom-aligned (terracotta band directly below) | L110 T70 R30 → `#f4ebdf` | 01-hero · 560,95,1105,748 |
| hero-figure-mobile | `hero/hero-figure-mobile-{480,850}.*` | 480×422, 850×748 | Mobile hero: full width under the copy, bottom-aligned | L90 T60 R30 → `#f4ebdf` | 01-hero · 770,95,850,748 |
| career-hands | `career/career-hands-{560,812}.*` | 560×246, 812×357 | Chapter card: top-right of the card, top/right-aligned | L120 B24 → `#f6efe5` | 02-work · 860,333,812,357 |
| projects-frame | `projects/projects-frame-{640,960}.*` | 640×393, 960×590 | Featured product: right ~60% over the CSS terracotta circle; the real screenshot goes **behind** it, inside the transparent window | L70 T/B/R16 → `#b26e58` (must sit on terracotta) | 03-products · 690,78,960,590 |
| projects-head | `projects/projects-head-300.*` | 300×548 | Fallback/mobile: head fragment alone | L40 R50 T/B16 → `#b26e58` | 03-products · 690,120,300,548 |
| beyond-reading | `beyond/beyond-reading-584.*` | 584×419 | Daily Reading card: right half, bottom/right-aligned | L80 T10 → `#f2eae0` | 04-beyond · 548,272,584,419 |
| beyond-music | `beyond/beyond-music-516.*` | 516×210 | Music card: middle band. The right edge butts against the HTML player panel `#222322` | L40 → `#f2eae0` (right edge is dark panel, unfaded) | 04-beyond · 290,706,516,210 |
| beyond-column | `beyond/beyond-column-{560,812}.*` | 560×183, 812×266 | Section header: top-right, top/right-aligned | L110 B36 → `#c0bfae` | 04-beyond · 860,0,812,266 |
| beyond-whoop-fragment | `beyond/beyond-whoop-fragment-144.*` | 144×206 | WHOOP card: bottom-right decoration | L36 T10 → `#f2eae0` | 04-beyond · 1492,708,144,206 |
| writing-thumb-head / -column / -mountain | `beyond/writing-thumb-*-100.*` | 100×68 / 100×68 / 100×61 | Writing row thumbnails (opaque, 1× only) | none | 04-beyond · 1183,{375,462,548},100,{68,68,61} |
| jj-listener | `jj/jj-listener-{680,1002}.*` | 680×470, 1002×692 | JJ callout: right ~60%, bottom-aligned to the oxblood section bottom | L160 T40 R24 → `#4f1816` | 05-jj · 670,20,1002,692 |
| jj-listener-mobile | `jj/jj-listener-mobile-{420,560}.*` | 420×512, 560×682 | Mobile JJ: full width below the copy, bottom-aligned | L50 T40 R40 → `#4f1816` | 05-jj · 860,30,560,682 |
| footer-hand | `footer/footer-hand-490.*` | 490×540 | Closing invitation: right edge, vertically centred on the headline/CTA, right-aligned | L30 T50 B40 → `#e5d9cc` (inside the CSS circle) | 06-footer · 1182,30,490,540 |

Largest WebP: projects-frame-960 (≈217 KB). Total for all 44 files: ≈2.2 MB.

### Positioning notes

- **Hero circle:** the figure includes part of the large faint circle (`#ecdecf`). The full circle is centred at about (1247, 450) in concept px, with r ≈ 507. Continue it in CSS.
- **Projects window:** in px of the 960-wide export, the transparent window's bounding box is left 294, top 80, right 808, bottom 484. As percentages that is 30.6% / 13.6% / 84.2% / 82%. The polygon is in the manifest. Darker marble shadows are partly translucent after colour-keying, so the layer only looks right over terracotta.
- **JJ orb:** it was removed from the art. In concept px it sat at (1481, 430) with r ≈ 80 plus glow, which is about (811, 410) in the 1002-wide export. Build it in CSS there. The darker oxblood circle behind the head (`#491614`) is baked in.
- **Footer:** the cursor and the headline's full stop were removed. Part of the light circle (`#e5d9cc`) is baked in. The full circle is centred at about (1295, 345) in concept px, with r ≈ 320.
- **Career:** the chart nodes, curve and axis were inpainted. A faint blueprint grid inside the halftone remains as texture.
- **Reading:** the floating sheets keep abstract ruled lines. These are not readable text.
- **Textures:** none exported. The concept paper grain is too subtle and non-tiling, so use a CSS/SVG noise overlay.

## Sampled palette (median of small patches in each concept)

| section | colours |
| --- | --- |
| Hero | paper `#f4ebdf`, paper-light `#f7f1e9`, circle `#ecdecf`, terracotta band `#b5644b`, oxblood (buttons) `#671816` |
| Career | sage section `#dcd8cc`, sage circle `#c2c1b1`, card `#f6efe5`, card warm edge `#d9baa8`, oxblood `#681816` |
| Products | paper `#efe7dc`, terracotta circle `#b26e58`, terracotta deep `#a2604b`, feature card `#d6a48e`, oxblood `#66211e`, frame interior `#141413` |
| Beyond | sage `#c0bfae`, paper `#ede5da`, card `#f2eae0`, oxblood `#6b2624`, music circle `#662823`, player dark `#222322` |
| JJ | oxblood `#4f1816`, oxblood circle `#491614`, oxblood deep `#3a1110`, ivory button `#f4ebe0`, footer paper `#ece2d5` |
| Footer | paper `#f0e8dd`, circle `#e5d9cc`, rule `#7d211d`, dark band `#1c1b1b` |

## Not isolated / dropped

- **Supporting product card art:** every card's artwork is dominated by fake UI. A plinth strip was tried and dropped because it still showed UI. No crop was shipped. Use CSS shapes plus real screenshots, or regenerate.
- **Products frame interior:** the fake UI was made transparent rather than repainted. Any regenerated version should have an empty interior.
