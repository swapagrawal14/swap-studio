// Swapnil brand kit renderer: node render.mjs <composition> <props.json> <out.mp4> [--concurrency 3] [--crf 18] [--preset medium] [--stills 30,200]
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME || '/usr/bin/chromium';
const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);

const [, , compId, propsPath, outPath, ...rest] = process.argv;
if (!compId || !propsPath || !outPath) {
  console.error('usage: render.sh <composition> <props.json> <out.mp4> [--concurrency 3] [--crf 18] [--preset medium] [--stills 30,200]');
  process.exit(2);
}
const flag = (n, d) => {
  const i = rest.indexOf(`--${n}`);
  return i >= 0 ? rest[i + 1] : d;
};
const concurrency = Number(flag('concurrency', 3));
const crf = Number(flag('crf', 18));
const preset = flag('preset', 'medium');
const stills = (flag('stills', '') || '').split(',').filter(Boolean).map(Number);

const props = JSON.parse(fs.readFileSync(propsPath, 'utf8'));
const jobId = crypto.randomBytes(4).toString('hex');
const jobDir = path.join(ROOT, '.jobs', jobId);
fs.mkdirSync(jobDir, {recursive: true});

// 1) voiceover + word timings from edge-tts
if (props.voiceText && !props.words) {
  const mp3 = path.join(jobDir, 'voice.mp3');
  const js = path.join(jobDir, 'words.json');
  log('edge-tts', props.voice || 'en-IN-NeerjaNeural');
  execFileSync('python3', [path.join(ROOT, 'tools/tts_words.py'), props.voiceText, mp3, js, '--voice', props.voice || 'en-IN-NeerjaNeural', '--rate', props.voiceRate || '+0%'], {stdio: 'inherit'});
  const w = JSON.parse(fs.readFileSync(js, 'utf8'));
  props.words = w.words;
  props.audio = mp3;
  if (compId === 'BrandShowcase' && props.contentSec == null) props.contentSec = Math.max(4, (w.words.at(-1)?.end ?? w.duration) + (props.voiceDelaySec ?? 0.3) + 0.6);
  log(`voice ${w.duration.toFixed(2)}s, ${w.words.length} words`);
}
// 2) SwapDraws clip length
if (props.video && !/^https?:/.test(props.video) && props.videoDurationSec == null) {
  const d = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', props.video]).toString().trim();
  props.videoDurationSec = Number(d);
  log(`video ${props.videoDurationSec}s`);
}

// 3) bundle (cached on a hash of src/ + public/)
const walk = (d) => fs.readdirSync(d, {withFileTypes: true}).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const h = crypto.createHash('sha1');
for (const f of [...walk(path.join(ROOT, 'src')), ...walk(path.join(ROOT, 'public'))].sort()) {
  const s = fs.statSync(f);
  h.update(`${f}:${s.size}:${s.mtimeMs}`);
}
const bundleDir = path.join(ROOT, '.cache', `bundle-${h.digest('hex').slice(0, 12)}`);
if (!fs.existsSync(path.join(bundleDir, 'index.html'))) {
  log('bundling…');
  fs.rmSync(path.join(ROOT, '.cache'), {recursive: true, force: true});
  await bundle({entryPoint: path.join(ROOT, 'src/index.ts'), outDir: bundleDir, publicDir: path.join(ROOT, 'public')});
  log('bundled');
} else log('bundle cache hit');

// 4) copy absolute-path props (audio, video, images) into the bundle's public dir
const pubDir = path.join(bundleDir, 'public', '_job', jobId);
const fix = (v) => {
  if (typeof v === 'string' && v.startsWith('/') && fs.existsSync(v) && fs.statSync(v).isFile()) {
    fs.mkdirSync(pubDir, {recursive: true});
    const name = path.basename(v);
    fs.copyFileSync(v, path.join(pubDir, name));
    return `_job/${jobId}/${name}`;
  }
  if (Array.isArray(v)) return v.map(fix);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fix(x)]));
  return v;
};
const inputProps = fix(props);

const common = {serveUrl: bundleDir, inputProps, browserExecutable: CHROME, chromeMode: 'chrome-for-testing', timeoutInMilliseconds: 90000};
const composition = await selectComposition({...common, id: compId});
log(`${compId} ${composition.width}x${composition.height} ${composition.durationInFrames}f @${composition.fps}`);
fs.mkdirSync(path.dirname(path.resolve(outPath)), {recursive: true});
let last = -1;
const tr = Date.now();
await renderMedia({
  ...common,
  composition,
  codec: 'h264',
  crf,
  x264Preset: preset,
  imageFormat: 'jpeg',
  jpegQuality: 95,
  pixelFormat: 'yuv420p',
  concurrency,
  outputLocation: outPath,
  onProgress: ({progress}) => {
    const p = Math.floor(progress * 10);
    if (p !== last) {
      last = p;
      log(`render ${p * 10}%`);
    }
  },
});
log(`video done in ${((Date.now() - tr) / 1000).toFixed(1)}s -> ${outPath}`);
for (const f of stills) {
  const png = outPath.replace(/\.mp4$/, '') + `-f${f}.png`;
  await renderStill({...common, composition, frame: f, output: png, imageFormat: 'png'});
  log(`still ${png}`);
}
fs.rmSync(pubDir, {recursive: true, force: true});
fs.writeFileSync(outPath.replace(/\.mp4$/, '') + '.props.json', JSON.stringify(inputProps, null, 1));
log('done');
