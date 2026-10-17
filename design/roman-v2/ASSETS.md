# Roman V2 asset registry

Status: 11 generated masters are accepted. Four small Beyond Work support crops remain explicitly interim until real writing and WHOOP content arrives.

The exact generation prompts and source references are in [`assets/CODEX_PROMPTS.md`](assets/CODEX_PROMPTS.md). Visual acceptance and revision history are in [`assets/QA.md`](assets/QA.md). The machine-readable runtime inventory is [`assets/manifest.json`](assets/manifest.json).

Run `node scripts/prepare-roman-v2-assets.mjs` after replacing any master. Add `--preview design/roman-v2/assets/previews` to refresh flattened QA previews. The preparation script prefers `assets/masters/<id>.png`, applies the configured edge fades, and emits AVIF/WebP files under `public/roman-v2/`.

All artwork is decorative: use `alt=""` and `aria-hidden="true"`. Serve AVIF first with WebP fallback. Eager-load only the hero.

## Accepted generated masters

| ID | Master PNG | Runtime output | Prepared dimensions | Placement / integration note |
| --- | --- | --- | --- | --- |
| `hero-figure` | `assets/masters/hero-figure.png` | `hero/hero-figure-{720,1105}.{avif,webp}` | 720×480, 1105×737 | Desktop hero, right aligned; headline and CTAs remain HTML. |
| `hero-figure-mobile` | `assets/masters/hero-figure-mobile.png` | `hero/hero-figure-mobile-{480,850}.{avif,webp}` | 480×480, 850×850 | Mobile hero below copy; corrected master keeps the whole laptop visible. |
| `career-hands` | `assets/masters/career-hands.png` | `career/career-hands-{560,812}.{avif,webp}` | 560×315, 812×457 | Career chapter visual, right aligned; chart and metrics remain HTML/CSS. |
| `projects-frame` | `assets/masters/projects-frame.png` | `projects/projects-frame-{640,960}.{avif,webp}` | 640×427, 960×640 | Product frame; place real product UI above the dark opening. |
| `projects-head` | `assets/masters/projects-head.png` | `projects/projects-head-300.{avif,webp}` | 300×450 | Mobile/fallback product portrait. |
| `beyond-reading` | `assets/masters/beyond-reading.png` | `beyond/beyond-reading-584.{avif,webp}` | 584×389 | Daily Reading card, right aligned; title and CTA remain HTML. |
| `beyond-music` | `assets/masters/beyond-music.png` | `beyond/beyond-music-516.{avif,webp}` | 516×290 | Music card artwork; waveform and controls are separate UI. |
| `beyond-column` | `assets/masters/beyond-column.png` | `beyond/beyond-column-{560,812}.{avif,webp}` | 560×315, 812×457 | Beyond Work header decoration, top-right. |
| `jj-listener` | `assets/masters/jj-listener.png` | `jj/jj-listener-{680,1002}.{avif,webp}` | 680×453, 1002×668 | Desktop JJ section; left copy zone and right orb zone are intentionally clear. |
| `jj-listener-mobile` | `assets/masters/jj-listener-mobile.png` | `jj/jj-listener-mobile-{420,560}.{avif,webp}` | 420×525, 560×700 | Mobile JJ portrait; orb and controls remain HTML/CSS. |
| `footer-hand` | `assets/masters/footer-hand.png` | `footer/footer-hand-490.{avif,webp}` | 490×490 | Closing invitation, right aligned inside the CSS circle. |

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

- Backgrounds: hero `#F4EBDF`, career card `#F6EFE5`, product terracotta `#B26E58`, Beyond card `#F2EAE0`, Beyond sage `#C0BFAE`, JJ oxblood `#4F1816`, footer circle `#E5D9CC`.
- Large section circles, dividers, grain, text, controls, metrics, product screenshots, chart lines and the JJ voice orb are CSS/HTML—not raster artwork.
- Generated halftone is part of the artwork; page-wide paper grain should be a separate lightweight CSS/SVG overlay.
- The asset phase does not complete the website QA gate. After implementation, capture same-size section screenshots and create actual/reference overlays and pixel-difference images as required by Track J in [`BUILD_PLAN.md`](BUILD_PLAN.md).
