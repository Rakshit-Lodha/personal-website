// Roman v2 motion keyframes (storyboard phase — no video generation).
//
// Reads design/roman-v2/motion/shots.json and, for every entry in `frames`:
//   1. builds the frame at master resolution:
//        - `source` only          → the approved master (or a previous frame) as-is
//        - `edit`                 → OpenAI Images edit of the source (padded to the API aspect, with a mask),
//                                   then the result is composited back over the source inside the feathered
//                                   mask only, so everything outside the edit region stays pixel-identical
//        - `warps`                → rigid rotation of a feathered region about a pivot (applied after `edit`);
//                                   used where an edit drifted identity, so the face stays the master's own pixels
//        - `notch`                → draws an engraved indicator groove on an elliptical knob face at a clock angle
//        - `shift`                → sharp translation of the source over its ground (code-motion storyboard)
//   2. writes keyframes/<id>.png  — the frame padded onto the master's flat ground to the Veo canvas (16:9 / 9:16)
//   3. writes previews/<id>.png   — the frame cropped back to the page aspect (the asset's masterCrop, if any)
// Generated sources are cached in work/<id>.raw.png; existing outputs are skipped unless --force.
//
// Run: node scripts/roman-v2-keyframes.mjs [--force] [--only id1,id2]
// Key: OPENAI_API_KEY from .env.local (fallback .env) — read here only, never printed.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const motionDir = path.join(root, 'design/roman-v2/motion');
const shots = JSON.parse(await fs.readFile(path.join(motionDir, 'shots.json'), 'utf8'));
const force = process.argv.includes('--force');
const onlyArg = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null;
const dirs = { keyframes: 'keyframes', previews: 'previews', work: 'work' };
for (const d of Object.values(dirs)) await fs.mkdir(path.join(motionDir, d), { recursive: true });
const usageLog = path.join(motionDir, 'work/usage.jsonl');

async function apiKey() {
  for (const f of ['.env.local', '.env']) {
    const text = await fs.readFile(path.join(root, f), 'utf8').catch(() => '');
    const m = text.match(/^OPENAI_API_KEY=(.*)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error('OPENAI_API_KEY not found in .env.local or .env');
}

const exists = (p) => fs.access(p).then(() => true, () => false);
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const rgb = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16), alpha: 1 });

// Pad an image buffer to a target aspect (w/h) on `ground`, placing the content per `anchor`
// ('center' | 'right' | 'left' | 'top' | 'bottom'). Returns the buffer plus the content rect.
async function padTo(buf, aspect, ground, anchor = 'center', mode = 'flat') {
  const { width: w, height: h } = await sharp(buf).metadata();
  let W = w, H = h;
  if (w / h < aspect) W = Math.round(h * aspect);
  else H = Math.round(w / aspect);
  const dx = W - w, dy = H - h;
  const left = anchor === 'right' ? dx : anchor === 'left' ? 0 : Math.floor(dx / 2);
  const top = anchor === 'bottom' ? dy : anchor === 'top' ? 0 : Math.floor(dy / 2);
  // 'copy' repeats the edge pixels instead of a flat colour (for strips whose edges are not one ground).
  const out = mode === 'copy'
    ? await sharp(buf).removeAlpha().extend({ top, bottom: H - h - top, left, right: W - w - left, extendWith: 'copy' }).png().toBuffer()
    : await sharp({ create: { width: W, height: H, channels: 3, background: rgb(ground) } })
      .composite([{ input: await sharp(buf).removeAlpha().toBuffer(), left, top }]).png().toBuffer();
  return { buf: out, W, H, rect: { x: left, y: top, w, h } };
}

// White = edit region, black = keep. Rects [x,y,w,h] and ellipses {ellipse:[cx,cy,rx,ry]} in source px.
function maskSvg(w, h, regions, feather = 0) {
  const shapes = regions.map((r) => Array.isArray(r)
    ? `<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" fill="#fff"/>`
    : `<ellipse cx="${r.ellipse[0]}" cy="${r.ellipse[1]}" rx="${r.ellipse[2]}" ry="${r.ellipse[3]}" fill="#fff"/>`).join('');
  const blur = feather ? `<filter id="f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${feather / 2}"/></filter>` : '';
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs>${blur}</defs><rect width="100%" height="100%" fill="#000"/><g ${feather ? 'filter="url(#f)"' : ''}>${shapes}</g></svg>`);
}

const frameById = Object.fromEntries(shots.frames.map((f) => [f.id, f]));
const masterOf = (frame) => (frame.source.startsWith('master:') ? shots.masters[frame.source.slice(7)] : masterOf(frameById[frame.source]));

async function sourceBuffer(ref) {
  if (ref.startsWith('master:')) {
    // `upscale` (Lanczos) lifts small page crops to a size Veo can use; `size` is the result.
    const m = shots.masters[ref.slice(7)];
    const buf = await fs.readFile(path.join(root, m.path));
    return m.upscale ? sharp(buf).resize(m.size[0], m.size[1], { kernel: 'lanczos3' }).png().toBuffer() : buf;
  }
  return buildFrame(frameById[ref]);
}

const built = new Map();
async function buildFrame(frame) {
  if (built.has(frame.id)) return built.get(frame.id);
  const master = masterOf(frame);
  const src = await sharp(await sourceBuffer(frame.source)).removeAlpha().png().toBuffer();
  const { width: w, height: h } = await sharp(src).metadata();
  let out = src;

  if (frame.edit) {
    const e = frame.edit;
    // `n` variants per call are cached as work/<id>.v<k>.png; `pick` selects the one composited.
    const n = e.n || 1;
    const variantPath = (k) => path.join(motionDir, dirs.work, n > 1 ? `${frame.id}.v${k}.png` : `${frame.id}.raw.png`);
    const rawPath = variantPath(e.pick || 0);
    if (!(await exists(rawPath)) || (force && (!onlyArg || onlyArg.includes(frame.id)))) {
      const [aw, ah] = e.size.split('x').map(Number);
      // `crop` [x,y,w,h] sends only that part of the source (more pixels for a small subject, e.g. a head);
      // the result is pasted back into the full frame before compositing.
      const [cx0, cy0, cw, ch] = e.crop || [0, 0, w, h];
      const apiSrc = e.crop ? await sharp(src).extract({ left: cx0, top: cy0, width: cw, height: ch }).png().toBuffer() : src;
      const padded = await padTo(apiSrc, aw / ah, master.ground, e.padAnchor || 'center');
      const image = await sharp(padded.buf).resize(aw, ah).png().toBuffer();
      // API mask: transparent = editable. Built from the hard (unfeathered) regions, grown by `grow` px.
      const grow = e.grow ?? 24;
      const hard = await sharp(maskSvg(cw, ch, e.regions.map((r) => Array.isArray(r) ? [r[0] - cx0, r[1] - cy0, r[2], r[3]] : { ellipse: [r.ellipse[0] - cx0, r.ellipse[1] - cy0, r.ellipse[2], r.ellipse[3]] }).map((r) => Array.isArray(r) ? [r[0] - grow, r[1] - grow, r[2] + 2 * grow, r[3] + 2 * grow] : { ellipse: [r.ellipse[0], r.ellipse[1], r.ellipse[2] + grow, r.ellipse[3] + grow] })))
        .png().toBuffer();
      const hardPadded = await sharp({ create: { width: padded.W, height: padded.H, channels: 3, background: '#000' } })
        .composite([{ input: hard, left: padded.rect.x, top: padded.rect.y }]).png().toBuffer()
        .then((b) => sharp(b).resize(aw, ah).greyscale().raw().toBuffer());
      const rgba = Buffer.alloc(aw * ah * 4);
      for (let i = 0; i < aw * ah; i++) { rgba[i * 4 + 3] = hardPadded[i] > 127 ? 0 : 255; }
      const maskPng = await sharp(rgba, { raw: { width: aw, height: ah, channels: 4 } }).png().toBuffer();

      const form = new FormData();
      form.append('model', shots.imageModel);
      form.append('prompt', `${shots.styleLock}\n\n${e.prompt}`);
      // Extra reference images (e.g. the identity photo) follow the edited image; the mask applies to the first.
      const refs = [];
      for (const r of e.references || []) {
        let ref = sharp(path.join(root, r.path)).rotate();
        if (r.crop) ref = ref.extract({ left: r.crop[0], top: r.crop[1], width: r.crop[2], height: r.crop[3] });
        refs.push(await ref.resize(1024, 1024, { fit: 'inside' }).png().toBuffer());
      }
      const field = refs.length ? 'image[]' : 'image';
      form.append(field, new Blob([image], { type: 'image/png' }), 'image.png');
      refs.forEach((b, i) => form.append(field, new Blob([b], { type: 'image/png' }), `ref${i}.png`));
      if (n > 1) form.append('n', String(n));
      form.append('mask', new Blob([maskPng], { type: 'image/png' }), 'mask.png');
      form.append('size', e.size);
      form.append('quality', e.quality || 'high');
      form.append('output_format', 'png');
      process.stdout.write(`  → edit ${frame.id} (${e.size}) … `);
      const t0 = Date.now();
      const res = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST', headers: { Authorization: `Bearer ${await apiKey()}` }, body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(`images/edits ${res.status}: ${json.error?.message || JSON.stringify(json).slice(0, 300)}`);
      console.log(`${((Date.now() - t0) / 1000).toFixed(0)}s`);
      await fs.appendFile(usageLog, JSON.stringify({ at: new Date().toISOString(), frame: frame.id, model: shots.imageModel, size: e.size, usage: json.usage ?? null }) + '\n');
      // Back to source geometry: undo the API resize and the padding.
      for (const [k, item] of json.data.entries()) {
        const gen = await sharp(Buffer.from(item.b64_json, 'base64')).resize(padded.W, padded.H)
          .extract({ left: padded.rect.x, top: padded.rect.y, width: cw, height: ch }).removeAlpha().png().toBuffer();
        await fs.writeFile(variantPath(k), e.crop ? await sharp(src).composite([{ input: gen, left: cx0, top: cy0 }]).png().toBuffer() : gen);
      }
    }
    // Composite generated pixels over the source inside the feathered mask only
    // (`compositeRegions`, when given, narrows what is kept from the edit).
    const soft = await sharp(maskSvg(w, h, e.compositeRegions || e.regions, e.feather ?? 40)).greyscale().raw().toBuffer();
    const genRaw = await sharp(rawPath).removeAlpha().raw().toBuffer();
    const srcRaw = await sharp(src).raw().toBuffer();
    const mix = Buffer.alloc(w * h * 3);
    for (let i = 0; i < w * h; i++) {
      const a = soft[i] / 255;
      for (let c = 0; c < 3; c++) mix[i * 3 + c] = Math.round(genRaw[i * 3 + c] * a + srcRaw[i * 3 + c] * (1 - a));
    }
    out = await sharp(mix, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer();
  } else if (frame.shift) {
    const [sx, sy] = frame.shift;
    const keyed = await sharp(path.join(root, frame.shiftSource)).ensureAlpha().toBuffer();
    const layer = await sharp(keyed).resize(w, h).toBuffer();
    const cut = { left: Math.max(0, -sx), top: Math.max(0, -sy), width: w - Math.abs(sx), height: h - Math.abs(sy) };
    out = await sharp({ create: { width: w, height: h, channels: 3, background: rgb(master.ground) } })
      .composite([{ input: await sharp(layer).extract(cut).toBuffer(), left: Math.max(0, sx), top: Math.max(0, sy) }])
      .png().toBuffer();
  }
  if (frame.notch) {
    // Engraved indicator notch drawn on an elliptical knob face: a dark radial groove with a hairline
    // highlight. `angle` is a clock angle (0 = 12 o'clock, clockwise); warm (finger) pixels are skipped
    // so the notch passes under the fingers.
    const { center: [cx, cy], rx, ry, angle, r0 = 0.3, r1 = 0.85, width = 3, neutralOnly = 18 } = frame.notch;
    const a = (angle * Math.PI) / 180, ux = Math.sin(a), uy = -Math.cos(a);
    const pt = (r) => [cx + ux * r * rx, cy + uy * r * ry];
    const [x0, y0] = pt(r0), [x1, y1] = pt(r1);
    const nx = -uy * 1.2, ny = ux * 1.2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">`
      + `<line x1="${x0 + nx}" y1="${y0 + ny}" x2="${x1 + nx}" y2="${y1 + ny}" stroke="rgba(255,255,255,0.35)" stroke-width="1" stroke-linecap="round"/>`
      + `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="rgba(18,17,16,0.8)" stroke-width="${width}" stroke-linecap="round"/></svg>`;
    const layer = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer();
    const cur = await sharp(out).removeAlpha().raw().toBuffer();
    const dst = Buffer.from(cur);
    for (let i = 0; i < w * h; i++) {
      const al = layer[i * 4 + 3] / 255;
      if (!al || cur[i * 3] - cur[i * 3 + 2] > neutralOnly) continue;
      for (let c = 0; c < 3; c++) dst[i * 3 + c] = Math.round(layer[i * 4 + c] * al + cur[i * 3 + c] * (1 - al));
    }
    out = await sharp(dst, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer();
  }
  for (const wp of frame.warps || []) {
    // Inverse-map each pixel inside the feathered region through a rotation of `angle` degrees
    // (positive = clockwise on screen) about `pivot`, with bilinear sampling.
    const soft = await sharp(maskSvg(w, h, wp.regions, wp.feather ?? 50)).greyscale().raw().toBuffer();
    const srcRaw = await sharp(out).removeAlpha().raw().toBuffer();
    const dst = Buffer.from(srcRaw);
    const t = (-wp.angle * Math.PI) / 180, cos = Math.cos(t), sin = Math.sin(t);
    const [px, py] = wp.pivot;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const a = soft[y * w + x] / 255;
      if (!a) continue;
      const sx = Math.min(w - 1.001, Math.max(0, px + (x - px) * cos - (y - py) * sin));
      const sy = Math.min(h - 1.001, Math.max(0, py + (x - px) * sin + (y - py) * cos));
      const x0 = Math.floor(sx), y0 = Math.floor(sy), fx = sx - x0, fy = sy - y0;
      for (let c = 0; c < 3; c++) {
        const v = (1 - fy) * ((1 - fx) * srcRaw[(y0 * w + x0) * 3 + c] + fx * srcRaw[(y0 * w + x0 + 1) * 3 + c])
          + fy * ((1 - fx) * srcRaw[((y0 + 1) * w + x0) * 3 + c] + fx * srcRaw[((y0 + 1) * w + x0 + 1) * 3 + c]);
        dst[(y * w + x) * 3 + c] = Math.round(v * a + srcRaw[(y * w + x) * 3 + c] * (1 - a));
      }
    }
    out = await sharp(dst, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer();
  }
  built.set(frame.id, out);
  return out;
}

const ASPECT = { '16:9': 16 / 9, '9:16': 9 / 16 };
for (const frame of shots.frames) {
  if (onlyArg && !onlyArg.includes(frame.id)) continue;
  const kPath = path.join(motionDir, dirs.keyframes, `${frame.id}.png`);
  const pPath = path.join(motionDir, dirs.previews, `${frame.id}.png`);
  if (!force && (await exists(kPath)) && (await exists(pPath))) { console.log(`skip ${frame.id}`); continue; }
  console.log(frame.id);
  const master = masterOf(frame);
  const buf = await buildFrame(frame);
  const { width: w, height: h } = await sharp(buf).metadata();
  if (frame.canvas === 'page') {
    await fs.writeFile(kPath, buf);
  } else {
    const padded = await padTo(buf, ASPECT[frame.canvas], master.ground, frame.anchor || 'center', master.padMode);
    await fs.writeFile(kPath, padded.buf);
    frame._canvas = { width: padded.W, height: padded.H, content: padded.rect };
  }
  const crop = master.pageCrop || [0, 0, w, h];
  await sharp(buf).extract({ left: crop[0], top: crop[1], width: crop[2], height: crop[3] }).png().toFile(pPath);
}
console.log('done');
