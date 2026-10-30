import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Theme} from '../theme';
import {ArrowCircle, HighlightSwipe, WobblyUnderline} from './Accents';

export type FactSeg = {text: string; fx?: 'highlight' | 'underline' | 'circle'; label?: string; angle?: number};
export type FactLine = {at: number; segs: FactSeg[]; size?: number; font?: 'title' | 'marker' | 'hand'};

/** Lines of big handwritten text on paper; each line pops in at `at` seconds and its accents draw after it. */
export const FactBoard: React.FC<{lines: FactLine[]; theme: Theme; top?: number}> = ({lines, theme, top}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const portrait = height > width;
  const u = Math.min(width, height) / 1080;
  return (
    <div style={{position: 'absolute', left: 70 * u, right: 70 * u, top: top ?? (portrait ? height * 0.13 : height * 0.12), textAlign: 'center'}}>
      {lines.map((ln, i) => {
        const f0 = Math.round(ln.at * fps);
        const pop = spring({frame: frame - f0, fps, config: {damping: 11, stiffness: 150}});
        const fc = ln.font === 'marker' ? theme.fonts.caption : ln.font === 'hand' ? theme.fonts.body : theme.fonts.title;
        const rough = theme.accents === 'rough';
        const fx = theme.accents === 'none' ? undefined : true;
        return (
          <div
            key={i}
            style={{
              fontFamily: fc.css, fontWeight: rough ? 700 : fc.weight, fontSize: (ln.size ?? 130) * u * fc.scale, color: theme.ink, lineHeight: 1.12,
              opacity: frame < f0 ? 0 : 1, transform: `scale(${pop}) rotate(${(i % 2 ? 1 : -1) * 1.2 * theme.tilt}deg)`, marginBottom: 10 * u,
            }}
          >
            {ln.segs.map((s, j) => {
              const st = f0 + 8 + j * 4;
              const key = `${i}-${j}`;
              if (s.fx === 'highlight')
                return <HighlightSwipe key={key} start={st} color={theme.highlight} seed={i * 10 + j + 3} clean={!rough} textColor={theme.highlightText}>{s.text}</HighlightSwipe>;
              if (s.fx === 'underline' && fx)
                return <WobblyUnderline key={key} start={st} color={theme.mark} thickness={11 * u} seed={i * 10 + j + 5} clean={!rough}>{s.text}</WobblyUnderline>;
              if (s.fx === 'circle' && fx)
                return (
                  <ArrowCircle key={key} start={st} color={theme.mark} thickness={10 * u} label={s.label} labelColor={theme.ink} labelSize={78 * u * theme.fonts.title.scale} labelFont={theme.fonts.title.css} labelWeight={theme.fonts.title.weight} angle={s.angle ?? 30} arrowLength={150 * u} seed={i * 10 + j + 7} clean={!rough}>
                    {s.text}
                  </ArrowCircle>
                );
              return <span key={key}>{s.text}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};

/** The pack's paper colour with a faint dot grid (colors.dots). */
export const Paper: React.FC<{theme: Theme}> = ({theme}) => {
  const {width, height} = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  return (
    <div
      style={{
        position: 'absolute', inset: 0, background: theme.paper,
        backgroundImage: `radial-gradient(${theme.dots} ${3.2 * u}px, transparent ${3.6 * u}px)`,
        backgroundSize: `${54 * u}px ${54 * u}px`,
      }}
    />
  );
};
