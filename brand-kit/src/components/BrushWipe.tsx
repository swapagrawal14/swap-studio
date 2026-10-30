import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {INK} from '../theme';
import {rng} from '../util';

/** A fat marker stroke that sweeps across the frame to hide a cut. Place it so `at` is the cut frame. */
export const BrushWipe: React.FC<{at: number; color: string; half?: number; seed?: number; outline?: string; clean?: boolean}> = ({at, color, half = 7, seed = 5, outline = INK, clean = false}) => {
  const frame = useCurrentFrame();
  const shape = useMemo(() => {
    const r = rng(seed);
    const top: string[] = [];
    const bot: string[] = [];
    for (let i = 0; i <= 12; i++) {
      const y = (i / 12) * 140 - 20;
      top.push(`${-30 + (r() - 0.5) * (clean ? 0 : 8)},${y}`);
      bot.push(`${130 + (r() - 0.5) * (clean ? 0 : 8)},${y}`);
    }
    return [...top, ...bot.reverse()].join(' ');
  }, [seed, clean]);
  if (frame < at - half || frame > at + half) return null;
  // in: sweep from left covering; out: uncover to the right
  const x = interpolate(frame, [at - half, at, at + half], [-175, 0, 175]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 50}}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%">
        <g transform={`translate(${x},0) skewX(-12)`}>
          <polygon points={shape} fill={color} stroke={outline} strokeWidth={10} vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
