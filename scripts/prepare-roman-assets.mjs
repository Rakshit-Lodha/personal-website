import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const design = path.join(root, 'design/roman');
const output = path.join(root, 'public/roman');
const record = JSON.parse(await fs.readFile(path.join(design, 'generation-record.json'), 'utf8'));
await fs.mkdir(path.join(design, 'masters'), { recursive: true });
await fs.mkdir(output, { recursive: true });
const assets = [];
const panels = [];
for (const entry of record.assets) {
  const masterRelative = `design/roman/masters/${entry.id}-v1.png`;
  const master = path.join(root, masterRelative);
  try { await fs.access(master); } catch { await fs.copyFile(entry.source, master); }
  const metadata = await sharp(master).metadata();
  const mobile = entry.id.endsWith('mobile');
  const texture = entry.id === 'plaster-texture';
  const widths = texture ? [512] : mobile ? [480, 800] : [960, 1600];
  const variants = [];
  for (const width of widths) {
    for (const format of ['webp', 'avif']) {
      const filename = `${entry.id}-v1-${width}.${format}`;
      const pipeline = sharp(master).resize({ width, withoutEnlargement: true });
      const info = await pipeline.toFormat(format, { quality: format === 'avif' ? 48 : 76, effort: 4 }).toFile(path.join(output, filename));
      variants.push({ path: `public/roman/${filename}`, url: `/roman/${filename}`, format, width: info.width, height: info.height, bytes: info.size });
    }
  }
  const safeArea = entry.id.startsWith('arrival') ? (mobile ? 'middle plaster region; keep headline below arch; constrain text to inner 75%' : 'left plaster region above relief; 8–56% horizontal')
    : entry.id.startsWith('journey') ? 'central plaster; put frieze in a separate header band if content grows'
    : entry.id.startsWith('playground') ? 'left/central plaster; WHOOP content remains normal HTML on an opaque reading surface'
    : entry.id.startsWith('closing') ? (mobile ? 'lower plaster wall; sunset should be its own visual header for long content' : 'sky for short controls only; put long closing quote on a separate ivory HTML section')
    : 'use at low opacity over solid ivory; seamless tiling is not yet verified';
  const asset = { ...entry, master: masterRelative, width: metadata.width, height: metadata.height, bytes: (await fs.stat(master)).size, variants, safeArea, layers: 'flattened image; no alpha/depth layers', focalPoint: { x: 0.5, y: 0.5 }, approval: 'generated candidate, awaiting in-browser fit and contrast review' };
  assets.push(asset);
  const preview = variants.find(v => v.format === 'webp' && v.width === widths[0]);
  panels.push(`<article><h2>${entry.id}</h2><img loading="lazy" src="../../${preview.path}" alt="${entry.id} architectural background"><p>${safeArea}</p><p>${metadata.width} × ${metadata.height} master · ${Math.round(preview.bytes / 1024)} KB preview</p><a href="../../${masterRelative}">Original PNG</a></article>`);
}
// Reusable architectural pieces cut from the masters so every section can carry real architecture.
// [name, master id, left, top, width, height] in master pixels. Exported 1:1; never resize non-uniformly.
const CROPS = [
  ['plaster-wall', 'journey-desktop', 150, 205, 1340, 585],
  ['plaster-wall-mobile', 'journey-mobile', 130, 420, 700, 980],
  // Interior of the journey frieze (between the pilasters); it travels slower than the walls in the hall.
  ['frieze', 'journey-desktop', 130, 0, 1415, 195],
];
const crops = [];
for (const [name, source, left, top, width, height] of CROPS) {
  for (const format of ['webp', 'avif']) {
    const filename = `${name}-v1.${format}`;
    const info = await sharp(path.join(design, 'masters', `${source}-v1.png`)).extract({ left, top, width, height })
      .toFormat(format, { quality: format === 'avif' ? 48 : 76, effort: 4 }).toFile(path.join(output, filename));
    crops.push({ name, source, region: { left, top, width, height }, url: `/roman/${filename}`, format, bytes: info.size });
  }
}
await fs.writeFile(path.join(design, 'asset-manifest.json'), JSON.stringify({ version: 1, created: record.created, generationMode: 'built-in imagegen', assets, crops }, null, 2) + '\n');
await fs.writeFile(path.join(design, 'gallery.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Roman asset library</title><style>body{font:16px/1.5 system-ui;margin:0;background:#eee6d8;color:#29251e;padding:32px}main{max-width:1400px;margin:auto}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}article{background:#faf7ef;padding:18px;border:1px solid #c7bca9}img{width:100%;height:340px;object-fit:contain;background:#e5dac6}h1{font-weight:500}h2{font-size:18px}p{font-size:14px}a{color:#7b2821}</style><main><h1>Roman architectural assets · v1</h1><p>Nine text-free generated masters with responsive AVIF/WebP exports. These are background plates, not functional page mockups. Browser composition and contrast review are still required.</p><section>${panels.join('')}</section></main></html>`);
console.log(JSON.stringify({ masters: assets.length, derivatives: assets.reduce((n,a) => n+a.variants.length,0), optimizedBytes: assets.flatMap(a=>a.variants).reduce((n,v)=>n+v.bytes,0), maxWebpBytes: Math.max(...assets.flatMap(a=>a.variants.filter(v=>v.format==='webp').map(v=>v.bytes))) }, null, 2));
