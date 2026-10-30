import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, INK, Theme} from '../theme';
import {useMeasure} from '../util';
import {roughRect, RoughPaths} from '../rough';
import {HighlightSwipe} from './Accents';
import {Tulip} from './Tulip';

/** Name tag that slides in from the left: tulip + name on a marker swipe + small subtitle. */
export const LowerThird: React.FC<{
  theme: Theme;
  title?: string; // defaults to theme.credit
  subtitle?: string; // defaults to channel · handle
  durationInFrames?: number; // when to slide out (frames after mount)
  bottom?: number; // px from bottom; default safe-zone per format
}> = ({theme, title, subtitle, durationInFrames = 90, bottom}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const portrait = height > width;
  const u = Math.min(width, height) / 1080;
  const inn = spring({frame, fps, config: {damping: 14, stiffness: 110}});
  const out = spring({frame: frame - (durationInFrames - 12), fps, config: {damping: 16, stiffness: 140}});
  const x = interpolate(inn - out, [0, 1], [-1.15, 0]);
  const [ref, size] = useMeasure<HTMLDivElement>();
  const box = size ? roughRect(4, 4, size.w - 8, size.h - 8, {fill: theme.paper, fillStyle: 'solid', stroke: INK, strokeWidth: 7 * u, roughness: 1.3, seed: 31}) : [];
  const shadow = size ? roughRect(4, 4, size.w - 8, size.h - 8, {fill: INK, fillStyle: 'solid', stroke: 'none', roughness: 1.2, seed: 32}) : [];
  const b = bottom ?? (portrait ? 420 * u : 90 * u);
  return (
    <div style={{position: 'absolute', left: (portrait ? 60 : 90) * u, bottom: b, transform: `translateX(${x * 100}%)`, zIndex: 20}}>
      {size && (
        <svg width={size.w} height={size.h} style={{position: 'absolute', left: 12 * u, top: 14 * u, overflow: 'visible'}}>
          <RoughPaths paths={shadow} />
        </svg>
      )}
      <div ref={ref} style={{position: 'relative', padding: `${26 * u}px ${44 * u}px ${24 * u}px ${150 * u}px`}}>
        {size && (
          <svg width={size.w} height={size.h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <RoughPaths paths={box} />
          </svg>
        )}
        <Tulip kind="pink" x={16 * u} y={-40 * u} height={170 * u} start={6} rotate={-10} />
        <div style={{position: 'relative', fontFamily: FONT.marker, fontSize: 58 * u, color: INK, whiteSpace: 'nowrap', lineHeight: 1.15}}>
          <HighlightSwipe start={10} duration={10} color={theme.id === 'ai' ? theme.accent2 : theme.accent} seed={41}>
            {title || theme.credit}
          </HighlightSwipe>
        </div>
        <div style={{position: 'relative', fontFamily: FONT.hand, fontSize: 42 * u, color: INK, whiteSpace: 'nowrap', marginTop: 4 * u}}>
          {subtitle || `${theme.channel} · ${theme.handle}`}
        </div>
      </div>
    </div>
  );
};
