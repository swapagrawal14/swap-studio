// SwapDraws deterministic renderer (Swapnil / swap-studio).
// Loads the SwapDraws app in headless Chromium, imports a `swapdraws: 1` storyboard,
// renders EVERY frame with the app's own engine (SD.engine.renderProjectFrame at t = f/fps),
// writes lossless PNGs, encodes with ffmpeg (H.264 yuv420p CRF18 +faststart) and muxes the
// storyboard's embedded audio (voiceover + per-scene audio layers) at their exact offsets.
// Rendering is a pure function of time, so frames are split across N parallel browser pages.
import puppeteer from 'puppeteer-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); if (i < 0) return def; const v = args[i + 1]; args.splice(i, 2); return v; };
const FPS = +opt('--fps', '30');
const SIZE = opt('--size', '1080x1920');
const WORKERS = +opt('--workers', '3');
const CRF = opt('--crf', '18');
const PRESET = opt('--preset', 'slow');
const KEEP = args.includes('--keep-frames'); if (KEEP) args.splice(args.indexOf('--keep-frames'), 1);
const [IN, OUT] = args;
if (!IN || !OUT) { console.error('usage: render.sh <storyboard.json> <out.mp4> [--fps 30] [--size 1080x1920] [--workers 3] [--crf 18] [--preset slow] [--keep-frames]'); process.exit(2); }
const [W, H] = SIZE.split('x').map(Number);
const APP = process.env.SWAPDRAWS_DIR || '/data/home/swap-draws';
const CHROME = process.env.CHROME || '/usr/bin/chromium';
const job = `${path.basename(OUT, '.mp4')}-${Date.now()}`;
const WORK = path.join(process.env.RENDER_TMP || '/data/home/render/tmp', job);
const FR = path.join(WORK, 'frames'); fs.mkdirSync(FR, { recursive: true });
const T0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - T0) / 1000).toFixed(1)}s]`, ...a);

// --- static server for the app ---
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(APP, path.normalize(p));
  if (!f.startsWith(APP) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const URL_ = `http://127.0.0.1:${server.address().port}/`;

// one browser PER worker: hidden tabs in a shared browser get throttled (toBlob/timers stall)
const LAUNCH = { executablePath: CHROME, headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--font-render-hinting=none', '--force-color-profile=srgb',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] };
const browsers = [];

async function openProject() {
  const browser = await puppeteer.launch(LAUNCH); browsers.push(browser);
  const pg = (await browser.pages())[0] || await browser.newPage();
  await pg.setViewport({ width: 1440, height: 900 });
  pg.on('pageerror', (e) => console.error('pageerror:', e.message));
  // keep the onboarding tour from interfering
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem('sd_tour_done', '1'); } catch {} });
  await pg.goto(URL_, { waitUntil: 'load' });
  await pg.waitForFunction(() => window.SD && SD.engine && SD.state, { timeout: 30000 });
  const prevName = await pg.evaluate(() => SD.state.project && SD.state.project.name);
  const input = await pg.$('#impJsonInput');
  await input.uploadFile(path.resolve(IN));
  const want = JSON.parse(fs.readFileSync(IN, 'utf8')).name;
  await pg.waitForFunction((n, prev) => SD.state.project && SD.state.project.name === n && (n !== prev || true), { timeout: 90000 }, want, prevName);
  // wait for fonts + every image asset to be decoded
  await pg.evaluate(async () => {
    if (SD.assets && SD.assets.ensureFontsLoaded) { try { await SD.assets.ensureFontsLoaded(); } catch {} }
    await document.fonts.ready;
  });
  await pg.evaluate(async (W, H) => {
    window.__c = SD.util.makeCanvas(W, H);
    window.__x = __c.getContext('2d');
    window.__draw = (t) => { const p = SD.state.project, ctx = __x; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
      ctx.scale(W / p.canvas.width, H / p.canvas.height); SD.engine.renderProjectFrame(p, t, ctx, { showHand: true, forExport: true }); };
    // warm every scene so lazily-loaded images are decoded before capture
    const p = SD.state.project, starts = SD.engine.sceneStarts(p);
    for (let pass = 0; pass < 3; pass++) { for (const s of starts) __draw(s + 0.5); await new Promise((r) => setTimeout(r, 400)); }
    window.__png = async (t) => { __draw(t); const bl = await new Promise((r) => __c.toBlob(r, 'image/png'));
      const buf = new Uint8Array(await bl.arrayBuffer()); let s = ''; for (let i = 0; i < buf.length; i += 32768) s += String.fromCharCode.apply(null, buf.subarray(i, i + 32768)); return btoa(s); };
  }, W, H);
  return pg;
}

// --- page 1: metadata + audio ---
const pg0 = await openProject();
const meta = await pg0.evaluate(async () => {
  const p = SD.state.project, starts = SD.engine.sceneStarts(p);
  const clips = [];
  p.scenes.forEach((s, i) => s.layers.forEach((l) => { if (l.type === 'audio' && l.audio && l.visible !== false) clips.push({ assetId: l.audio.assetId, at: starts[i] + (l.start || 0), duration: l.duration || 0, volume: l.audio.volume ?? 1, loop: !!l.audio.loop }); }));
  if (p.voiceover && p.voiceover.assetId) clips.push({ assetId: p.voiceover.assetId, at: p.voiceover.start || 0, duration: 0, volume: p.voiceover.volume ?? 1, loop: false, vo: true });
  for (const c of clips) { const buf = new Uint8Array(await SD.assets.audioArrayBuffer(c.assetId)); let s = ''; for (let i = 0; i < buf.length; i += 32768) s += String.fromCharCode.apply(null, buf.subarray(i, i + 32768)); c.b64 = btoa(s); }
  const sfx = p.scenes.some((s) => s.layers.some((l) => l.anim && l.anim.sfx));
  return { duration: SD.engine.projectDuration(p), canvas: p.canvas, clips, sfx };
});
const TOTAL = Math.round(meta.duration * FPS);
log(`project ${meta.duration.toFixed(3)} s -> ${TOTAL} frames @ ${FPS} fps, ${W}x${H}, ${meta.clips.length} audio clip(s), workers ${WORKERS}`);
if (meta.sfx) log('note: pencil-scratch SFX layers are synthesized live by the app and are NOT included');

// --- render frames in parallel contiguous chunks ---
const pages = [pg0]; for (let i = 1; i < WORKERS; i++) pages.push(await openProject());
let done = 0, lastBeat = Date.now();
const chunk = Math.ceil(TOTAL / WORKERS);
await Promise.all(pages.map(async (pg, w) => {
  const a = w * chunk, b = Math.min(TOTAL, a + chunk);
  for (let f = a; f < b; f += 6) {
    const batch = []; for (let i = f; i < Math.min(b, f + 6); i++) batch.push(i);
    const res = await pg.evaluate(async (ts) => { const o = []; for (const t of ts) o.push(await __png(t)); return o; }, batch.map((i) => i / FPS));
    batch.forEach((i, k) => fs.writeFileSync(path.join(FR, `f${String(i).padStart(6, '0')}.png`), Buffer.from(res[k], 'base64')));
    done += batch.length;
    if (w === 0 && (f - a) % 120 === 0) log(`frames ${done}/${TOTAL}`);
    if (Date.now() - lastBeat > 30000) { lastBeat = Date.now(); log(`progress ${done}/${TOTAL}`); }
  }
}));
for (const b of browsers) await b.close(); server.close();
const nFiles = fs.readdirSync(FR).filter((f) => f.endsWith('.png')).length;
if (nFiles !== TOTAL) { console.error(`frame count mismatch: ${nFiles} != ${TOTAL}`); process.exit(1); }
log(`rendered ${nFiles} frames`);

// --- audio ---
const ff = ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(FR, 'f%06d.png')];
const filters = []; const labels = [];
meta.clips.forEach((c, i) => {
  const af = path.join(WORK, `a${i}.bin`); fs.writeFileSync(af, Buffer.from(c.b64, 'base64'));
  if (c.loop) ff.push('-stream_loop', '-1'); ff.push('-i', af);
  const ms = Math.max(0, Math.round(c.at * 1000));
  let ch = `[${i + 1}:a]aresample=48000,aformat=channel_layouts=stereo`;
  if (c.duration > 0) ch += `,atrim=0:${c.duration}`;
  ch += `,volume=${c.volume},adelay=${ms}|${ms}[a${i}]`;
  filters.push(ch); labels.push(`[a${i}]`);
});
const vdur = (TOTAL / FPS).toFixed(6);
if (labels.length) {
  filters.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=longest,apad,atrim=0:${vdur}[aout]`);
  ff.push('-filter_complex', filters.join(';'), '-map', '0:v', '-map', '[aout]', '-c:a', 'aac', '-b:a', '192k');
} else ff.push('-map', '0:v');
ff.push('-c:v', 'libx264', '-preset', PRESET, '-crf', CRF, '-pix_fmt', 'yuv420p', '-r', String(FPS), '-frames:v', String(TOTAL),
  '-movflags', '+faststart', '-t', vdur, OUT);
log('encoding…');
const r = spawnSync('ffmpeg', ff, { stdio: 'inherit' });
if (r.status !== 0) { console.error('ffmpeg failed'); process.exit(1); }
if (!KEEP) fs.rmSync(WORK, { recursive: true, force: true }); else log('frames kept in', FR);
const probe = spawnSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames,r_frame_rate,width,height:format=duration', '-of', 'compact', OUT], { encoding: 'utf8' });
log('done ->', OUT); console.log(probe.stdout.trim());
log(`total render time ${((Date.now() - T0) / 1000).toFixed(1)} s`);
