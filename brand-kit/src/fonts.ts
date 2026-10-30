import {continueRender, delayRender} from 'remotion';
import type {Face, Theme} from './theme';
import {asset} from './util';

// Swapnil's base faces, always loaded (keeps the legacy look identical).
const BASE: Face[] = [
  {family: 'Caveat', css: '', weight: '700', src: 'fonts/Caveat-700-normal.woff2', scale: 1},
  {family: 'Permanent Marker', css: '', weight: '400', src: 'fonts/PermanentMarker-400-normal.woff2', scale: 1},
  {family: 'Patrick Hand', css: '', weight: '400', src: 'fonts/PatrickHand-400-normal.woff2', scale: 1},
];

const cache = new Map<string, Promise<void>>();

// A face with `src` (bundled woff2 in public/, a pack-relative file, or a url) loads via FontFace.
// A face with only a family name is fetched from Google Fonts (needs internet while rendering).
const loadFace = (f: Face): Promise<void> => {
  const key = `${f.family}|${f.weight}|${f.style || ''}|${f.src || 'google'}`;
  if (cache.has(key)) return cache.get(key)!;
  const handle = delayRender(`font ${key}`);
  let p: Promise<void>;
  if (f.src) {
    const ff = new FontFace(f.family, `url(${asset(f.src)}) format('woff2')`, {weight: String(f.weight), style: f.style || 'normal'});
    p = ff.load().then((l) => void document.fonts.add(l));
  } else {
    const fam = encodeURIComponent(f.family).replace(/%20/g, '+');
    const ital = f.style === 'italic' ? 1 : 0;
    const href = `https://fonts.googleapis.com/css2?family=${fam}:ital,wght@${ital},${f.weight}&display=block`;
    p = new Promise<void>((res, rej) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => res();
      link.onerror = () => rej(new Error(`Google font "${f.family}" ${f.weight} failed to load`));
      document.head.appendChild(link);
    }).then(() => document.fonts.load(`${f.style || 'normal'} ${f.weight} 40px '${f.family}'`).then(() => undefined));
  }
  p = p.catch((e) => console.error('font load failed', f.family, e)).finally(() => continueRender(handle));
  cache.set(key, p);
  return p;
};

/** Register a theme's faces (sync, idempotent). Call during render so measuring components wait for them. */
export const useThemeFonts = (t: Theme) => {
  if (typeof document === 'undefined') return;
  [t.fonts.title, t.fonts.body, t.fonts.caption, t.fonts.label].forEach(loadFace);
};

/** Resolves once every face registered so far has loaded. */
export const fontsReady = (): Promise<void> => {
  if (typeof document === 'undefined') return Promise.resolve();
  BASE.forEach(loadFace);
  return Promise.all([...cache.values()]).then(() => undefined);
};
