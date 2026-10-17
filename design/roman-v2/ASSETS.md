# Roman V2 asset registry

Status: 11 generated masters are accepted. Four small Beyond Work support crops remain explicitly interim until real writing and WHOOP content arrives.

The exact generation prompts and source references are in [`assets/CODEX_PROMPTS.md`](assets/CODEX_PROMPTS.md). Visual acceptance and revision history are in [`assets/QA.md`](assets/QA.md). The machine-readable runtime inventory is [`assets/manifest.json`](assets/manifest.json).

Run `node scripts/prepare-roman-v2-assets.mjs` after replacing any master. Add `--preview design/roman-v2/assets/previews` to refresh flattened QA previews (`<id>.png` on the section colour, `<id>-magenta.png` on magenta to check the matte). The preparation script prefers `assets/masters/<id>.png`, applies an optional master crop, keys the master's flat ground to alpha, applies the configured edge fades, and emits AVIF/WebP files under `public/roman-v2/`. No export is wider than its master.

## Transparency

The generated masters ship on opaque flat grounds. For every master marked *alpha* below, the script fits the ground colour (a least-squares plane through border-like pixels, to absorb faint gradients) and keys it out:

- **Ground** is every pixel within `hi` (7) of the fitted ground that is reachable from the image border, seeded only from long flat border runs or flat 9×9 patches, so a highlight where the figure is cut by the frame cannot leak inward. Small enclosed ground-coloured holes (the insides of halftone squares, 6–600 px, flat and ringed by strong ink) are keyed as well; marble highlights ringed by stone are not.
- **Edges** take alpha from their distance to the ground relative to the strongest neighbour, and their colour is un-mixed from the ground, so halftone dots and marble silhouettes keep their own colour with no light or dark halo on any background.
- Components no longer need filters, blend modes or masks to hide an art box; the section colour and CSS circles show through.

All artwork is decorative: use `alt=""` and `aria-hidden="true"`. Serve AVIF first with WebP fallback. Eager-load only the hero.

## Accepted generated masters

| ID | Master PNG | Runtime output | Prepared dimensions | Transparency | Placement / integration note |
| --- | --- | --- | --- | --- | --- |
| `hero-figure` | `assets/masters/hero-figure.png` (1536×1024) | `hero/hero-figure-{720,1105,1536}.{avif,webp}` | 720×480, 1105×737, 1536×1024 | alpha | Desktop hero, right aligned; headline and CTAs remain HTML. The CSS circle shows behind the head. |
| `hero-hands-mobile` | `assets/masters/hero-figure-mobile.png` (1254×1254), crop x 0, y 640, 780×614 | `hero/hero-hands-mobile-{480,780}.{avif,webp}` | 480×378, 780×614 | alpha | Mobile hero: laptop and typing hands only, full-bleed and anchored to the bottom of the first fold below the copy. |
| `career-hands` | `assets/masters/career-hands.png` (1672×941), **cropped** to x 600–1672, y 90–880 | `career/career-hands-{560,812,1072}.{avif,webp}` | 560×413, 812×598, 1072×790 | alpha; fades left 140, top 90, right 48 | The master's hands sit in its right ~60 %. The crop drops the empty left field, the sparse top rows and the empty rows under the plinth, so the hands fill the right of the concept's 860–1672 box. Drawn at 0.72× at 1672 with the plinth baseline at y≈672; forearms and drape rise over the sage above the card. Chart and metrics remain HTML/CSS. |
| `projects-frame` | `assets/masters/projects-frame.png` (1536×1024) | `projects/projects-frame-{640,960,1536}.{avif,webp}` | 640×427, 960×640, 1536×1024 | alpha (the #141413 opening stays opaque) | Product frame on the CSS terracotta disc; real product UI sits above the dark opening. |
| `projects-head` | `assets/masters/projects-head.png` | `projects/projects-head-300.{avif,webp}` | 300×450 | opaque ground, edge fades | Mobile/fallback product portrait (currently unused). |
| `beyond-reading` | `assets/masters/beyond-reading.png` (1536×1024) | `beyond/beyond-reading-{584,1168}.{avif,webp}` | 584×389, 1168×779 | alpha; fade left 460 (the left 30 % halftone dissolves) | Daily Reading card, right aligned; title and CTA remain HTML. |
| `beyond-music` | `assets/masters/beyond-music.png` | `beyond/beyond-music-536.{avif,webp}` | 536×215 | opaque card ground, edge fades | Music card artwork (oxblood circle, halftone hand, knob), cropped from the approved music close-up; waveform, progress and controls are separate UI. Its ground matches the card on the left and the player panel on the right. |
| `beyond-column` | `assets/masters/beyond-column.png` (1672×941) | `beyond/beyond-column-{560,812,1672}.{avif,webp}` | 560×315, 812×457, 1672×941 | alpha; fade left 570 | Beyond Work header decoration, top-right, over a CSS sage disc (concept's disc behind the foliage). |
| `jj-listener` | `assets/masters/jj-listener.png` (1536×1024) | `jj/jj-listener-{680,1002,1536}.{avif,webp}` | 680×453, 1002×668, 1536×1024 | alpha | Desktop JJ section on the concept oxblood `#4F1816`, with the darker CSS disc behind the head. Drawn up to ≈1750 px wide at 1920, so it is upscaled past 1536 there (master limit). |
| `jj-listener-mobile` | `assets/masters/jj-listener-mobile.png` (1122×1402) | `jj/jj-listener-mobile-{420,560,1122}.{avif,webp}` | 420×525, 560×700, 1122×1402 | alpha | Mobile JJ portrait; orb and controls remain HTML/CSS. |
| `footer-hand` | `assets/masters/footer-hand.png` (1254×1254) | `footer/footer-hand-{490,980,1254}.{avif,webp}` | 490², 980², 1254² | alpha | Closing invitation, right aligned inside the CSS circle. |

Runtime paths above are relative to `public/roman-v2/`; browser URLs begin with `/roman-v2/`.

## Interim support crops

These are intentionally allowed by the content-availability rule: their sections render in the final composition, but unavailable actions remain inert. Replace the art when real content arrives.

| ID | Current source | Runtime output | Dimensions |
| --- | --- | --- | --- |
| `beyond-whoop-fragment` | `concepts/04-beyond-work-approved.png` | `beyond/beyond-whoop-fragment-144.{avif,webp}` | 144×206 |
| `writing-thumb-head` | `concepts/04-beyond-work-approved.png` | `beyond/writing-thumb-head-100.{avif,webp}` | 100×68 |
| `writing-thumb-column` | `concepts/04-beyond-work-approved.png` | `beyond/writing-thumb-column-100.{avif,webp}` | 100×68 |
| `writing-thumb-mountain` | `concepts/04-beyond-work-approved.png` | `beyond/writing-thumb-mountain-100.{avif,webp}` | 100×61 |

## Palette and composition rules

- Backgrounds: hero `#F4EBDF`, career card `#F6EFE5`, product terracotta `#B26E58`, Beyond card `#F2EAE0`, Beyond sage `#C0BFAE`, JJ oxblood `#4F1816` (disc `#441412`), footer circle `#E5D9CC`.
- Large section circles, dividers, grain, text, controls, metrics, product screenshots, chart lines and the JJ voice orb are CSS/HTML—not raster artwork.
- Generated halftone is part of the artwork; page-wide paper grain should be a separate lightweight CSS/SVG overlay.
- The asset phase does not complete the website QA gate. After implementation, capture same-size section screenshots and create actual/reference overlays and pixel-difference images as required by Track J in [`BUILD_PLAN.md`](BUILD_PLAN.md).
