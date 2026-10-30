import React, {useMemo} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {INK, WHITE, YELLOW} from '../theme';
import {clamp, hashStr, rng, useMeasure} from '../util';
import {roughCurve, roughEllipse, roughLine, roughPolygon, RoughPaths} from '../rough';

const prog = (frame: number, start: number, dur: number) =>
  clamp(interpolate(frame, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - clamp(t), 2.2)}));

// wipe a 0..100 polygon in from the left by clamping x to the reveal edge
const reveal = (pts: [number, number][], p: number) => pts.map(([x, y]) => `${Math.min(x, p * 100)},${y}`).join(' ');

/** Marker highlighter swipe that paints itself behind its children (left -> right). */
export const HighlightSwipe: React.FC<{
  children: React.ReactNode;
  start?: number; // frame
  duration?: number; // frames
  color?: string;
  seed?: number;
  tilt?: number;
  clean?: boolean; // straight-edged bar instead of a jagged marker stroke
  textColor?: string; // recolour the text once the bar is under it
  style?: React.CSSProperties;
}> = ({children, start = 0, duration = 10, color = YELLOW, seed = 7, tilt = -1.5, clean = false, textColor, style}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, duration);
  const shapes = useMemo(() => {
    const r = rng(seed);
    const j = clean ? 0 : 1;
    const mk = (yTop: number, yBot: number) => {
      const top: [number, number][] = [];
      const bot: [number, number][] = [];
      const n = 9;
      for (let i = 0; i <= n; i++) {
        const x = 2 + (96 * i) / n;
        top.push([x, yTop + (r() - 0.5) * 7 * j]);
        bot.push([x, yBot + (r() - 0.5) * 7 * j]);
      }
      const pts = clean
        ? [[0, yTop], ...top, [100, yTop], [100, yBot], ...bot.reverse(), [0, yBot]]
        : [[0, (yTop + yBot) / 2 + (r() - 0.5) * 6], ...top, [100, (yTop + yBot) / 2 + (r() - 0.5) * 6], ...bot.reverse()];
      return pts as [number, number][];
    };
    return clean ? [mk(4, 102), mk(4, 102)] : [mk(34, 92), mk(40, 98)];
  }, [seed, clean]);
  const [ref, size] = useMeasure<HTMLSpanElement>();
  const W = size ? size.w * 1.12 : 0, H = size ? size.h : 0;
  return (
    <span ref={ref} style={{position: 'relative', display: 'inline-block', ...style}}>
      {size && p > 0 && (
        <svg
          width={W}
          height={H}
          style={{position: 'absolute', left: -size.w * 0.06, top: 0, overflow: 'visible', transform: `rotate(${clean ? 0 : tilt}deg)`, pointerEvents: 'none'}}
        >
          <g transform={`scale(${W / 100}, ${H / 100})`}>
            <polygon points={reveal(shapes[0], p)} fill={color} />
            <polygon points={reveal(shapes[1], p)} fill={color} opacity={0.75} />
          </g>
        </svg>
      )}
      <span style={{position: 'relative', color: textColor && p > 0.5 ? textColor : undefined}}>{children}</span>
    </span>
  );
};

/** Hand-drawn wobbly underline that draws itself under its children. */
export const WobblyUnderline: React.FC<{
  children: React.ReactNode;
  start?: number;
  duration?: number;
  color?: string;
  thickness?: number;
  seed?: number;
  double?: boolean;
  clean?: boolean;
  style?: React.CSSProperties;
}> = ({children, start = 0, duration = 12, color = INK, thickness = 9, seed = 3, double = false, clean = false, style}) => {
  const frame = useCurrentFrame();
  const [ref, size] = useMeasure<HTMLSpanElement>();
  const p = prog(frame, start, duration);
  const ps = useMemo(() => {
    if (!size) return [];
    const {w, h} = size;
    const y = h * 0.92;
    const r = rng(seed);
    const line = (dy: number, s: number) =>
      roughCurve(
        [
          [-w * 0.03, y + dy + (r() - 0.5) * 6],
          [w * 0.3, y + dy + 6 + (r() - 0.5) * 8],
          [w * 0.65, y + dy - 2 + (r() - 0.5) * 8],
          [w * 1.03, y + dy - 8 + (r() - 0.5) * 6],
        ],
        clean
          ? {stroke: color, strokeWidth: thickness, roughness: 0, bowing: 0, seed: s, disableMultiStroke: true}
          : {stroke: color, strokeWidth: thickness, roughness: 1.1, bowing: 1.5, seed: s, disableMultiStroke: true},
      );
    if (clean) {
      const st = {stroke: color, strokeWidth: thickness, roughness: 0, bowing: 0, seed, disableMultiStroke: true};
      const ln = (dy: number) => roughCurve([[0, y + dy], [w, y + dy]], st);
      return double ? [...ln(0), ...ln(thickness * 2.2)] : ln(0);
    }
    return double ? [...line(0, seed), ...line(thickness * 2.2, seed + 1)] : line(0, seed);
  }, [size, seed, color, thickness, double, clean]);
  return (
    <span ref={ref} style={{position: 'relative', display: 'inline-block', ...style}}>
      {size && (
        <svg width={size.w} height={size.h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
          <RoughPaths paths={ps} progress={p} />
        </svg>
      )}
      {children}
    </span>
  );
};

/** Rough circle drawn around children, then an arrow swoops in with an optional handwritten label. */
export const ArrowCircle: React.FC<{
  children: React.ReactNode;
  start?: number;
  duration?: number;
  color?: string;
  thickness?: number;
  angle?: number; // where the arrow comes from, degrees (0 = right, 90 = below)
  arrowLength?: number;
  label?: string;
  labelColor?: string;
  labelSize?: number;
  labelFont?: string;
  labelWeight?: number | string;
  clean?: boolean;
  seed?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  start = 0,
  duration = 14,
  color = INK,
  thickness = 8,
  angle = 35,
  arrowLength = 200,
  label,
  labelColor,
  labelSize = 64,
  labelFont = "'Caveat', cursive",
  labelWeight = 700,
  clean = false,
  seed = 11,
  style,
}) => {
  const frame = useCurrentFrame();
  const [ref, size] = useMeasure<HTMLSpanElement>();
  const pc = prog(frame, start, duration);
  const pa = prog(frame, start + duration * 0.8, duration * 0.8);
  const pl = prog(frame, start + duration * 1.3, 8);
  const geo = useMemo(() => {
    if (!size) return null;
    const {w, h} = size;
    const cx = w / 2, cy = h / 2;
    const rx = w / 2 + Math.max(24, w * 0.14), ry = h / 2 + Math.max(18, h * 0.12);
    const cl = clean ? {roughness: 0, bowing: 0, disableMultiStroke: true} : {};
    const circle = roughEllipse(cx, cy, rx * 2, ry * 2, {stroke: color, strokeWidth: thickness, roughness: 1.3, bowing: 2, seed, ...cl});
    const a = (angle * Math.PI) / 180;
    const ex = cx + Math.cos(a) * (rx + 10), ey = cy + Math.sin(a) * (ry + 10);
    const tx = cx + Math.cos(a) * (rx + arrowLength), ty = cy + Math.sin(a) * (ry + arrowLength);
    // bend the shaft a little
    const mx = (ex + tx) / 2 - Math.sin(a) * arrowLength * 0.18, my = (ey + ty) / 2 + Math.cos(a) * arrowLength * 0.18;
    const shaft = roughCurve([[tx, ty], [mx, my], [ex, ey]], {stroke: color, strokeWidth: thickness, roughness: 1, seed: seed + 1, disableMultiStroke: true, ...cl});
    const back = Math.atan2(my - ey, mx - ex);
    const hl = Math.max(34, thickness * 5);
    const h1 = roughLine(ex, ey, ex + Math.cos(back + 0.5) * hl, ey + Math.sin(back + 0.5) * hl, {stroke: color, strokeWidth: thickness, roughness: 0.8, seed: seed + 2, disableMultiStroke: true, ...cl});
    const h2 = roughLine(ex, ey, ex + Math.cos(back - 0.5) * hl, ey + Math.sin(back - 0.5) * hl, {stroke: color, strokeWidth: thickness, roughness: 0.8, seed: seed + 3, disableMultiStroke: true, ...cl});
    return {circle, shaft, heads: [...h1, ...h2], tx, ty, a};
  }, [size, color, thickness, angle, arrowLength, seed, clean]);
  return (
    <span ref={ref} style={{position: 'relative', display: 'inline-block', ...style}}>
      {children}
      {size && geo && (
        <>
          <svg width={size.w} height={size.h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
            <RoughPaths paths={geo.circle} progress={pc} />
            <RoughPaths paths={geo.shaft} progress={pa} />
            <RoughPaths paths={geo.heads} progress={clamp(pa * 3 - 2)} />
          </svg>
          {label && (
            <span
              style={{
                position: 'absolute',
                left: geo.tx,
                top: geo.ty,
                transform: `translate(${Math.cos(geo.a) > 0.35 ? '-10%' : Math.cos(geo.a) < -0.35 ? '-90%' : '-50%'}, ${Math.sin(geo.a) >= 0 ? '0%' : '-100%'}) rotate(-4deg) scale(${0.7 + 0.3 * pl})`,
                opacity: pl,
                whiteSpace: 'nowrap',
                fontFamily: labelFont,
                fontWeight: labelWeight,
                fontSize: labelSize,
                color: labelColor || color,
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          )}
        </>
      )}
    </span>
  );
};

/** Hand-drawn 4-point sparkle star that pops in and twinkles. */
export const Sparkle: React.FC<{
  x: number; y: number; size?: number; start?: number; color?: string; outline?: string; seed?: number; rotate?: number; clean?: boolean;
}> = ({x, y, size = 60, start = 0, color = WHITE, outline = INK, seed = 1, rotate = 0, clean = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - start, fps, config: {damping: 9, stiffness: 160}});
  const tw = 1 + 0.12 * Math.sin((frame + seed * 13) / 7);
  const ps = useMemo(() => {
    const s = 50, k = 0.24;
    const pts: [number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4 - Math.PI / 2;
      const rr = i % 2 === 0 ? s : s * k;
      pts.push([60 + Math.cos(ang) * rr, 60 + Math.sin(ang) * rr]);
    }
    return roughPolygon(pts, clean
      ? {fill: color, fillStyle: 'solid', stroke: outline, strokeWidth: 5, roughness: 0, bowing: 0, disableMultiStroke: true, seed}
      : {fill: color, fillStyle: 'solid', stroke: outline, strokeWidth: 5, roughness: 0.9, seed});
  }, [color, outline, seed, clean]);
  if (frame < start) return null;
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={{position: 'absolute', left: x - size / 2, top: y - size / 2, transform: `scale(${pop * tw}) rotate(${rotate + (frame % 360) * 0.15}deg)`, overflow: 'visible'}}
    >
      <RoughPaths paths={ps} progress={1} />
    </svg>
  );
};
