import React from 'react';
import rough from 'roughjs';
import {clamp} from './util';

const gen = rough.generator();
export type RoughOpts = Record<string, any>;

type P = {d: string; stroke: string; strokeWidth: number; fill?: string};
const paths = (drawable: any): P[] => (gen as any).toPaths(drawable);

export const roughLine = (x1: number, y1: number, x2: number, y2: number, o: RoughOpts) => paths(gen.line(x1, y1, x2, y2, o));
export const roughCurve = (pts: [number, number][], o: RoughOpts) => paths(gen.curve(pts, o));
export const roughEllipse = (cx: number, cy: number, w: number, h: number, o: RoughOpts) => paths(gen.ellipse(cx, cy, w, h, o));
export const roughRect = (x: number, y: number, w: number, h: number, o: RoughOpts) => paths(gen.rectangle(x, y, w, h, o));
export const roughPolygon = (pts: [number, number][], o: RoughOpts) => paths(gen.polygon(pts, o));
export const roughCircle = (cx: number, cy: number, d: number, o: RoughOpts) => paths(gen.circle(cx, cy, d, o));

// Renders rough.js paths. progress (0..1) draws the outline on like a pen; fills fade in near the end.
export const RoughPaths: React.FC<{paths: P[]; progress?: number; fillAt?: number}> = ({paths: ps, progress = 1, fillAt = 0.55}) => {
  const fillOp = clamp((progress - fillAt) / (1 - fillAt + 1e-6));
  return (
    <>
      {ps.map((p, i) => {
        const isFill = p.fill && p.fill !== 'none' && (!p.stroke || p.stroke === 'none');
        if (isFill) return <path key={i} d={p.d} fill={p.fill} stroke="none" opacity={fillOp} />;
        return (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={p.stroke}
            strokeWidth={p.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={progress <= 0.001 ? 0 : 1}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - clamp(progress)}
          />
        );
      })}
    </>
  );
};
