import React, {useMemo} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Theme} from '../theme';

export type Word = {word: string; start: number; end: number}; // seconds, relative to the voiceover start

type Page = {words: Word[]; start: number; end: number};

export const paginate = (words: Word[], maxWords: number, maxChars: number): Page[] => {
  const pages: Page[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) pages.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
    cur = [];
  };
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const chars = cur.reduce((a, x) => a + x.word.length + 1, 0) + w.word.length;
    if (cur.length && (cur.length >= maxWords || chars > maxChars || (prev && w.start - prev.end > 0.45) || /[.!?,;:]$/.test(prev?.word || ''))) flush();
    cur.push(w);
  });
  flush();
  return pages;
};

/**
 * Word-by-word karaoke captions. The spoken word turns to the accent colour and pops.
 * Times are in seconds from the start of the enclosing Sequence.
 */
export const WordCaptions: React.FC<{
  words: Word[];
  theme: Theme;
  top?: number; // px from top of the frame; default per format
  maxWords?: number;
  fontSize?: number;
  activeColor?: string;
}> = ({words, theme, top, maxWords, fontSize, activeColor}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const portrait = height > width;
  const u = Math.min(width, height) / 1080;
  const t = frame / fps;
  const pages = useMemo(() => paginate(words, maxWords ?? (portrait ? 3 : 5), portrait ? 18 : 32), [words, maxWords, portrait]);
  const idx = pages.findIndex((p, i) => t >= p.start - 0.05 && t < (pages[i + 1]?.start ?? p.end + 0.6) - 0.05);
  if (idx < 0) return null;
  const page = pages[idx];
  const enter = spring({frame: frame - Math.round(page.start * fps), fps, config: {damping: 12, stiffness: 200}});
  const cf = theme.fonts.caption;
  const fs = fontSize ?? (portrait ? 100 : 84) * u * cf.scale;
  const act = activeColor || theme.highlight;
  const stroke = theme.stickerStroke === 'none' ? undefined : theme.stickerStroke;
  return (
    <div
      style={{
        position: 'absolute', left: 60 * u, right: 60 * u, top: top ?? (portrait ? height * 0.6 : height * 0.74),
        textAlign: 'center', fontFamily: cf.css, fontWeight: cf.weight, fontSize: fs, lineHeight: 1.22, zIndex: 30, letterSpacing: '0.03em', wordSpacing: '0.12em',
        transform: `scale(${interpolate(enter, [0, 1], [0.82, 1])})`,
        textTransform: theme.captionCase === 'upper' ? 'uppercase' : theme.captionCase === 'lower' ? 'lowercase' : undefined,
      }}
    >
      {page.words.map((w, i) => {
        const active = t >= w.start - 0.02 && t < (page.words[i + 1]?.start ?? page.end + 0.6);
        const said = t >= w.start - 0.02;
        const pop = active ? spring({frame: frame - Math.round(w.start * fps), fps, config: {damping: 10, stiffness: 260}}) : 0;
        return (
          <React.Fragment key={i}>
            <span
              style={{
                display: 'inline-block',
                color: active ? act : theme.sticker,
                opacity: said ? 1 : 0.92,
                WebkitTextStroke: stroke ? `${10 * u}px ${stroke}` : undefined,
                paintOrder: 'stroke fill',
                transform: `scale(${1 + 0.14 * pop}) rotate(${active ? -2 * theme.tilt : 0}deg)`,
                textShadow: stroke ? `${6 * u}px ${7 * u}px 0 ${stroke}` : undefined,
              }}
            >
              {w.word}
            </span>{' '}
          </React.Fragment>
        );
      })}
    </div>
  );
};
