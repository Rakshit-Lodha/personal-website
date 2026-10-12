# Roman asset library — v1

Created 12 October 2026 using the built-in imagegen tool. These are text-free architectural background candidates for the approved Roman website, not screenshots to use as whole pages.

## Ready now

- Nine PNG masters in `masters/`: desktop/mobile arrival, journey, playground and dusk closing, plus one plaster texture.
- 34 responsive AVIF and WebP exports in `../../public/roman/`. Widths: desktop 960/1600, mobile 480/800, texture 512. Source resolution is preserved in the masters; no upscaling.
- `gallery.html`: local contact sheet with every scene, safe-area guidance and links to masters.
- `asset-manifest.json`: exact paths, sizes, dimensions, variants, provenance, prompts and intended usage.
- `generation-record.json`: full prompt set and original tool output file locations. All nine were generated with built-in imagegen, not an API/CLI fallback.
- `references/`: four previously approved design boards copied into the project.
- `source-media/`: original loader video and check image copied without modifying the originals.

The 34 image exports total approximately 2.25 MB. The largest WebP is approximately 174 KB. A page must choose a responsive variant, not load every export. Encoding used Sharp; no artistic retouching was done during export.

## Usage by section

| Section | Assets | Integration notes |
| --- | --- | --- |
| Arrival | `arrival-desktop`, `arrival-mobile` | HTML name/copy over plaster. Do not position text over relief or sky. Portrait has its own composition. |
| Work journey | `journey-desktop`, `journey-mobile` | For expanding accordions, treat the relief as a header decoration and allow the reading surface to grow. Never stretch figures vertically with content. |
| Projects | `plaster-texture` + actual product captures | Real product imagery supplies the focal point. Generated finance-product mockups are not accurate KRUX assets. |
| Daily reading / writing | `plaster-texture` at low opacity + CSS ivory | Typography and controls are HTML. Tiling is requested but not yet verified; use one softly blended texture until tested. |
| Playground / WHOOP | `playground-desktop`, `playground-mobile` | Keep plain WHOOP numbers on opaque ivory where necessary. No data-driven scenery or strings. |
| JJ | `closing-desktop`, `closing-mobile` | Dusk setting. Use ivory reading panels when contrast against sky is insufficient. |
| Contact / quote | Shared dusk transition + plaster / CSS ivory | The quote needs a separate content-sized section; do not squeeze long text into the scenic picture. |

Use `<picture>` with separate mobile/desktop sources or equivalent art direction; specify intrinsic dimensions. These are decorative, so use empty alt text where the same information is communicated by content. Lazy-load everything below the opening. Preview safe areas at 360/390/430px and desktop before declaring layout approval. Natural silhouettes and carved figures in generated artwork are atmospheric interpretations, not historically verified reconstructions.

## Still needed before a finished website

- Mobile loader export, clean video poster, and final attribution treatment. Copied loader is a source, not a newly finished mobile asset.
- Real project screenshots and verified public career/logo content.
- Selected and licensed display font files.
- Optional transparent foreground cutouts and depth layers for independent parallax. Current scenes are flattened PNGs; modest whole-image movement is possible, independent column/sky movement is not.
- Actual daily Muse audio/covers and authored writing when published.
- Social preview artwork once final typography/copy are chosen.
- In-browser crop/contrast/section-height validation. The desktop closing scene has a detailed lower relief rather than a completely blank quote area; use a separate ivory quote section. The playground and arrival scenes are visually similar; vary cropping or reuse one if the full-page prototype feels repetitive.

These remaining tasks should not block the opening prototype. Do not describe the entire website asset inventory as finished merely because these backgrounds exist.

## Rebuild image exports

From repository root:

```sh
node scripts/prepare-roman-assets.mjs
```

This uses existing project Sharp and copies original generated files only when the local master is absent. It rebuilds derivatives/manifest/gallery. Once masters are present, regeneration works without access to the original Codex image directory. Keep original masters and provenance; version future artwork with a new name rather than silently changing v1.
