// Style packs -> the resolved Theme every component reads.
// A pack lives in styles/<name>/style.json (see styles/README.md). Props pick one with
//   "style": "<name>"            a pack folder name (render.mjs reads it from disk; built-ins also work in Studio)
//   "style": { ...inline pack }  a full or partial pack; "extends": "<name>" fills the gaps
//   "channel": "edu" | "ai"      legacy alias for swap-edu / swap-ai
import {BUILTIN_STYLES} from './styles';

export const PINK = '#F0509A';
export const YELLOW = '#FFD94A';
export const INK = '#141414';
export const CREAM = '#FFF8EC';
export const WHITE = '#FFFFFF';
export const LEAF = '#3DAA4A';

export type ChannelId = 'edu' | 'ai';
export type Format = '9:16' | '16:9';

export type FontSpec = string | {family: string; weight?: number | string; src?: string; fallback?: string; scale?: number; style?: string};
export type StyleColors = {
  bg: string; paper: string; ink: string; accent: string; accent2: string;
  sun?: string; textOnBg?: string; wipe?: string; wipe2?: string; wipeOutline?: string; shadow?: string; ring?: string;
  underline?: string; mark?: string; dots?: string; sparkle?: string; sparkleOutline?: string; highlightText?: string; tagText?: string;
};
export type StylePack = {
  name: string;
  label?: string;
  extends?: string;
  kicker?: string;
  colors: StyleColors;
  fonts: {title: FontSpec; body: FontSpec; caption: FontSpec; label?: FontSpec};
  accents?: 'rough' | 'clean' | 'none';
  sparkles?: boolean;
  radius?: number;
  glow?: boolean;
  decorations?: string[];
  imageStylePrompt?: string;
  voice?: {name?: string; rate?: string};
  endCard?: {name?: string; handle?: string; channel?: string; cta?: string; avatar?: string; button?: string; ctaOutline?: boolean};
  captions?: {highlightColor?: string; case?: 'none' | 'upper' | 'lower'; color?: string; stroke?: string};
};
export type StyleInput = string | (Partial<StylePack> & {extends?: string});

export type Face = {family: string; css: string; weight: number | string; src?: string; scale: number; style?: string};

export type Theme = {
  id: string; // pack name ('swap-edu', 'chalkboard', ...)
  channel: string;
  handle: string;
  credit: string;
  cta: string;
  button: string;
  avatar?: string;
  bg: string; // main background
  sun: string; // big circle behind title ('none' hides it)
  paper: string;
  ink: string;
  accent: string; // tag colour
  accent2: string;
  textOnBg: string;
  wipe: string;
  wipe2: string;
  wipeOutline: string;
  highlight: string; // marker swipe / active caption word
  highlightText?: string;
  tagText: string;
  shadow: string;
  ring: string;
  underline: string;
  mark: string; // fact-board underline + circle
  dots: string;
  sparkle: string;
  sparkleOutline: string;
  sticker: string; // caption / name fill
  stickerStroke: string;
  ctaOutline: boolean;
  fonts: {title: Face; body: Face; caption: Face; label: Face};
  accents: 'rough' | 'clean' | 'none';
  sparkles: boolean;
  tilt: number; // 1 = hand-drawn lean, 0 = straight
  radius: number;
  glow: boolean;
  decorations: string[];
  captionCase: 'none' | 'upper' | 'lower';
  imageStylePrompt?: string;
};

const isObj = (v: any) => v && typeof v === 'object' && !Array.isArray(v);
export const deepMerge = <T,>(a: any, b: any): T => {
  if (!isObj(a) || !isObj(b)) return (b === undefined ? a : b) as T;
  const o: any = {...a};
  for (const k of Object.keys(b)) o[k] = isObj(a[k]) && isObj(b[k]) ? deepMerge(a[k], b[k]) : b[k] === undefined ? a[k] : b[k];
  return o;
};

const face = (f: FontSpec | undefined, dflt: Face): Face => {
  if (!f) return dflt;
  const o = typeof f === 'string' ? {family: f} : f;
  const fb = o.fallback || 'sans-serif';
  return {family: o.family, css: `'${o.family}', ${fb}`, weight: o.weight ?? 400, src: o.src, scale: o.scale ?? 1, style: o.style};
};

/** Resolve a pack (name, inline object, or legacy channel) into a full StylePack. */
export const resolvePack = (style?: StyleInput, channel?: string): StylePack => {
  const named = (n?: string): StylePack | undefined => (n ? (BUILTIN_STYLES as any)[n] : undefined);
  const legacy = channel === 'ai' ? 'swap-ai' : 'swap-edu';
  if (!style) return named(legacy)!;
  if (typeof style === 'string') {
    const p = named(style) || named(style.replace(/^swap-?/, 'swap-'));
    if (!p) console.warn(`style "${style}" is not built in; pass it through render.sh (which reads styles/) or inline it. Using ${legacy}.`);
    return p || named(legacy)!;
  }
  let base: StylePack | undefined = style.extends ? named(style.extends) : undefined;
  if (style.extends && !base) console.warn(`extends "${style.extends}" not built in`);
  if (!base && !(style.colors && style.fonts)) base = named(legacy);
  return deepMerge<StylePack>(base || {}, style);
};

export const themeFromPack = (p: StylePack): Theme => {
  const c = p.colors;
  const accents = p.accents || 'rough';
  const title = face(p.fonts?.title, face('Caveat', null as any));
  const body = face(p.fonts?.body, title);
  const caption = face(p.fonts?.caption, title);
  const ec = p.endCard || {};
  return {
    id: p.name || 'custom',
    channel: ec.channel ?? p.kicker ?? p.label ?? '',
    handle: ec.handle ?? '@yourhandle',
    credit: ec.name ?? 'Your Name',
    cta: ec.cta ?? 'Follow for more!',
    button: ec.button ?? '+ Follow',
    avatar: ec.avatar,
    bg: c.bg,
    sun: c.sun ?? c.accent,
    paper: c.paper,
    ink: c.ink,
    accent: c.accent,
    accent2: c.accent2,
    textOnBg: c.textOnBg ?? c.ink,
    wipe: c.wipe ?? c.accent,
    wipe2: c.wipe2 ?? c.accent2,
    wipeOutline: c.wipeOutline ?? c.ink,
    highlight: p.captions?.highlightColor ?? c.accent,
    highlightText: c.highlightText,
    tagText: c.tagText ?? c.ink,
    shadow: c.shadow ?? c.ink,
    ring: c.ring ?? c.ink,
    underline: c.underline ?? c.accent,
    mark: c.mark ?? c.accent,
    dots: c.dots ?? `${c.ink}22`,
    sparkle: c.sparkle ?? WHITE,
    sparkleOutline: c.sparkleOutline ?? c.ink,
    sticker: p.captions?.color ?? WHITE,
    stickerStroke: p.captions?.stroke ?? c.ink,
    ctaOutline: ec.ctaOutline ?? false,
    fonts: {title, body, caption, label: face(p.fonts?.label, caption)},
    accents,
    sparkles: p.sparkles ?? accents !== 'none',
    tilt: accents === 'rough' ? 1 : 0,
    radius: p.radius ?? 14,
    glow: !!p.glow,
    decorations: p.decorations || [],
    captionCase: p.captions?.case || 'none',
    imageStylePrompt: p.imageStylePrompt,
  };
};

export const getTheme = (channel?: string, overrides?: Partial<Theme>, style?: StyleInput): Theme => ({
  ...themeFromPack(resolvePack(style, channel)),
  ...(overrides || {}),
});

/** Legacy constants (Swapnil's packs). New code should read theme.fonts.*.css. */
export const FONT = {
  title: "'Caveat', cursive",
  marker: "'Permanent Marker', cursive",
  hand: "'Patrick Hand', cursive",
};

/** roughjs options adjusted for the pack: 'clean'/'none' draw the same shapes with straight lines. */
export const ro = (t: Theme, o: Record<string, any>) => (t.accents === 'rough' ? o : {...o, roughness: 0, bowing: 0, disableMultiStroke: true});

export const decoration = (t: Theme, i: number) => (t.decorations.length ? t.decorations[i % t.decorations.length] : undefined);

export const dims = (f?: string) =>
  f === '16:9' ? {width: 1920, height: 1080} : {width: 1080, height: 1920};
