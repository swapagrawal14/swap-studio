import {useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {fontsReady} from './fonts';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// deterministic PRNG so every frame / every render tab draws the same wobble
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const hashStr = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

// resolve an asset: http(s) and data urls pass through, everything else is a staticFile in public/
export const asset = (src?: string) => {
  if (!src) return undefined;
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  return staticFile(src.replace(/^\/+/, ''));
};

// measure an element's layout size (ignores transforms) after fonts are in
export const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<{w: number; h: number} | null>(null);
  const [handle] = useState(() => delayRender('measure'));
  useLayoutEffect(() => {
    let live = true;
    fontsReady()
      .then(() => (document as any).fonts.ready)
      .then(() => {
        if (live && ref.current) setSize({w: ref.current.offsetWidth, h: ref.current.offsetHeight});
      })
      .finally(() => continueRender(handle));
    return () => {
      live = false;
    };
  }, [handle]);
  return [ref, size] as const;
};
