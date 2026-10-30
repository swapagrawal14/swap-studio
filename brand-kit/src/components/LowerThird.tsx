import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {decoration, Theme} from '../theme';
import {useMeasure} from '../util';
import {roughRect, RoughPaths} from '../rough';
import {HighlightSwipe} from './Accents';
import {Decoration} from './Tulip';

/** Name tag that slides in from the left: decoration + name on a marker swipe + small subtitle. */
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
  const rough = theme.accents === 'rough';
  const {body: bf, label: lf} = theme.fonts;
  const deco = decoration(theme, 0);
  const [ref, size] = useMeasure<HTMLDivElement>();
  const box = size && rough ? roughRect(4, 4, size.w - 8, size.h - 8, {fill: theme.paper, fillStyle: 'solid', stroke: theme.ink, strokeWidth: 7 * u, roughness: 1.3, seed: 31}) : [];
  const shadow = size && rough ? roughRect(4, 4, size.w - 8, size.h - 8, {fill: theme.ink, fillStyle: 'solid', stroke: 'none', roughness: 1.2, seed: 32}) : [];
  const clean: React.CSSProperties = rough
    ? {}
    : {background: theme.paper, border: `${7 * u}px solid ${theme.ink}`, borderRadius: Math.min(theme.radius * u, 40 * u), boxShadow: `${12 * u}px ${14 * u}px 0 ${theme.shadow}`};
  const b = bottom ?? (portrait ? 420 * u : 90 * u);
  return (
    <div style={{position: 'absolute', left: (portrait ? 60 : 90) * u, bottom: b, transform: `translateX(${x * 100}%)`, zIndex: 20}}>
      {size && rough && (
        <svg width={size.w} height={size.h} style={{position: 'absolute', left: 12 * u, top: 14 * u, overflow: 'visible'}}>
          <RoughPaths paths={shadow} />
        </svg>
      )}
      <div ref={ref} style={{position: 'relative', padding: `${26 * u}px ${44 * u}px ${24 * u}px ${(deco ? 150 : 44) * u}px`, ...clean}}>
        {size && rough && (
          <svg width={size.w} height={size.h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <RoughPaths paths={box} />
          </svg>
        )}
        <Decoration src={deco} x={16 * u} y={-40 * u} height={170 * u} start={6} rotate={-10} />
        <div style={{position: 'relative', fontFamily: lf.css, fontWeight: lf.weight, fontSize: 58 * u * lf.scale, color: theme.ink, whiteSpace: 'nowrap', lineHeight: 1.15}}>
          <HighlightSwipe start={10} duration={10} color={theme.highlight} seed={41} clean={!rough} textColor={theme.highlightText}>
            {title || theme.credit}
          </HighlightSwipe>
        </div>
        <div style={{position: 'relative', fontFamily: bf.css, fontWeight: bf.weight, fontSize: 42 * u * bf.scale, color: theme.ink, whiteSpace: 'nowrap', marginTop: 4 * u}}>
          {subtitle || `${theme.channel} · ${theme.handle}`}
        </div>
      </div>
    </div>
  );
};
