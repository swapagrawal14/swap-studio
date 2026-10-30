import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {INK, YELLOW} from '../theme';
import {clamp, hashStr, rng} from '../util';
import {HighlightSwipe} from './Accents';

/**
 * Handwritten text that writes itself in word by word with a soft pen-edge wipe.
 * `highlight` (a word or phrase inside `text`) gets a marker swipe once it has been written.
 * Use "\n" for a forced line break.
 */
export const WriteOnText: React.FC<{
  text: string;
  start?: number; // frame
  cps?: number; // characters per second
  fontFamily?: string;
  fontWeight?: number;
  fontSize: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  lineHeight?: number;
  highlight?: string;
  highlightColor?: string;
  wiggle?: number; // max degrees each word leans
  style?: React.CSSProperties;
}> = ({
  text,
  start = 0,
  cps = 16,
  fontFamily = "'Caveat', cursive",
  fontWeight = 700,
  fontSize,
  color = INK,
  strokeColor,
  strokeWidth = 0,
  lineHeight = 1.05,
  highlight,
  highlightColor = YELLOW,
  wiggle = 1.6,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fpc = fps / cps;
  const r = rng(hashStr(text));
  const hl = (highlight || '').toLowerCase().split(/\s+/).filter(Boolean);
  const tokens = text.replace(/\n/g, ' \n ').split(/ +/).filter((t) => t.length);
  let chars = 0;
  // find highlight span (consecutive tokens)
  const lower = tokens.map((t) => t.toLowerCase().replace(/[^a-z0-9.'%-]/g, ''));
  let hs = -1;
  if (hl.length) {
    for (let i = 0; i + hl.length <= lower.length; i++) {
      if (hl.every((w, j) => lower[i + j] === w.replace(/[^a-z0-9.'%-]/g, ''))) {
        hs = i;
        break;
      }
    }
  }
  const items: React.ReactNode[] = [];
  let hlGroup: React.ReactNode[] = [];
  let hlEndFrame = 0;
  tokens.forEach((tok, i) => {
    if (tok === '\n') {
      items.push(<br key={`br${i}`} />);
      return;
    }
    const s = start + chars * fpc;
    const len = tok.length + 1;
    chars += len;
    const p = clamp((frame - s) / (len * fpc));
    const edge = p * 130;
    const lean = (r() - 0.5) * 2 * wiggle;
    const dy = (r() - 0.5) * fontSize * 0.04;
    const word = (
      <span
        key={`w${i}`}
        style={{
          display: 'inline-block',
          padding: '0 0.14em',
          margin: '0 -0.14em',
          transform: `rotate(${lean}deg) translateY(${dy}px)`,
          WebkitMaskImage: `linear-gradient(to right, #000 ${edge - 18}%, transparent ${edge}%)`,
          maskImage: `linear-gradient(to right, #000 ${edge - 18}%, transparent ${edge}%)`,
          WebkitTextStroke: strokeWidth ? `${strokeWidth}px ${strokeColor || INK}` : undefined,
          paintOrder: 'stroke fill',
        }}
      >
        {tok}
      </span>
    );
    const inHl = hs >= 0 && i >= hs && i < hs + hl.length;
    if (inHl) {
      hlGroup.push(word);
      if (hlGroup.length > 1) hlGroup.splice(hlGroup.length - 1, 0, ' ');
      hlEndFrame = s + len * fpc;
      if (i === hs + hl.length - 1) {
        items.push(
          <HighlightSwipe key={`hl${i}`} start={hlEndFrame} duration={9} color={highlightColor} seed={hashStr(tok) % 1000}>
            {hlGroup}
          </HighlightSwipe>,
        );
        items.push(' ');
        hlGroup = [];
      }
    } else {
      items.push(word);
      items.push(' ');
    }
  });
  return (
    <div style={{fontFamily, fontWeight, fontSize, color, lineHeight, textWrap: 'balance', ...style} as React.CSSProperties}>{items}</div>
  );
};

/** Total frames WriteOnText needs to finish writing. */
export const writeDuration = (text: string, fps: number, cps = 16) => Math.ceil(((text.replace(/\n/g, ' ').length + 1) * fps) / cps);
