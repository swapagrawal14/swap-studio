import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, INK, Theme} from '../theme';
import {clamp, useMeasure} from '../util';
import {roughRect, RoughPaths} from '../rough';
import {Sparkle} from './Accents';
import {Tulip} from './Tulip';
import {WriteOnText, writeDuration} from './WriteOnText';

export type TitleCardProps = {
  title: string;
  highlight?: string;
  kicker?: string; // small tag above the card, defaults to the channel name
  subtitle?: string;
};

/** Paper card on the channel colour with a big sun circle; the title writes itself in, tulips pop, sparkles twinkle. */
export const TitleCard: React.FC<TitleCardProps & {theme: Theme}> = ({title, highlight, kicker, subtitle, theme}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const portrait = height > width;
  const u = Math.min(width, height) / 1080;
  const cardW = portrait ? 900 * u : 1320 * u;
  const titleSize = (portrait ? 150 : 140) * u;
  const writeStart = 12;
  const wd = writeDuration(title, fps);
  const sunPop = spring({frame, fps, config: {damping: 14, stiffness: 90}});
  const cardPop = spring({frame: frame - 3, fps, config: {damping: 12, stiffness: 120}});
  const tagPop = spring({frame: frame - 8, fps, config: {damping: 9, stiffness: 160}});
  const subOp = clamp((frame - writeStart - wd) / 10);
  const [ref, size] = useMeasure<HTMLDivElement>();
  const outline = size
    ? roughRect(6, 6, size.w - 12, size.h - 12, {stroke: INK, strokeWidth: 9 * u, roughness: 1.4, bowing: 1.2, seed: 21})
    : [];
  const shadow = size
    ? roughRect(6, 6, size.w - 12, size.h - 12, {fill: theme.id === 'ai' ? theme.sun : INK, fillStyle: 'solid', stroke: 'none', roughness: 1.2, seed: 22})
    : [];
  const sunD = (portrait ? 980 : 900) * u;
  const cx = width / 2, cy = height / 2;
  const sparkles = portrait
    ? [[150, 300], [930, 420], [120, 1500], [960, 1580], [880, 230], [200, 1690]]
    : [[220, 160], [1720, 200], [160, 900], [1760, 880], [1500, 120], [400, 960]];
  return (
    <AbsoluteFill style={{background: theme.bg, overflow: 'hidden'}}>
      {/* sun circle, like the avatar */}
      <div
        style={{
          position: 'absolute', left: cx - sunD / 2, top: cy - sunD / 2, width: sunD, height: sunD, borderRadius: '50%',
          background: theme.sun, transform: `scale(${sunPop})`, opacity: 0.95,
        }}
      />
      {sparkles.map(([x, y], i) => (
        <Sparkle key={i} x={x * (portrait ? u : u)} y={y * u} size={(i % 2 ? 54 : 78) * u} start={6 + i * 4} seed={i + 1} color={i % 3 === 2 ? theme.accent2 : '#FFFFFF'} />
      ))}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: cardW, transform: `rotate(-2deg) scale(${cardPop})`}}>
          {/* channel tag */}
          <div
            style={{
              position: 'absolute', top: -58 * u, left: 40 * u, zIndex: 3, transform: `rotate(-5deg) scale(${tagPop})`, transformOrigin: 'left center',
              background: theme.accent, border: `${6 * u}px solid ${INK}`, borderRadius: `${18 * u}px ${10 * u}px ${22 * u}px ${12 * u}px`,
              padding: `${8 * u}px ${28 * u}px`, fontFamily: FONT.marker, fontSize: 46 * u, color: INK, whiteSpace: 'nowrap',
              boxShadow: `${6 * u}px ${6 * u}px 0 ${INK}`,
            }}
          >
            {kicker || theme.channel}
          </div>
          {size && (
            <svg width={size.w} height={size.h} style={{position: 'absolute', left: 16 * u, top: 18 * u, overflow: 'visible'}}>
              <RoughPaths paths={shadow} progress={1} />
            </svg>
          )}
          <div ref={ref} style={{position: 'relative', background: theme.paper, borderRadius: 14 * u, padding: `${80 * u}px ${60 * u}px ${64 * u}px`, textAlign: 'center'}}>
            {size && (
              <svg width={size.w} height={size.h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                <RoughPaths paths={outline} progress={1} />
              </svg>
            )}
            <WriteOnText text={title} start={writeStart} fontSize={titleSize} highlight={highlight} highlightColor={theme.id === 'ai' ? theme.accent2 : theme.accent} lineHeight={1.02} />
            {subtitle && (
              <div style={{fontFamily: FONT.hand, fontSize: 54 * u, color: INK, marginTop: 22 * u, opacity: subOp, transform: `translateY(${(1 - subOp) * 16 * u}px)`}}>
                {subtitle}
              </div>
            )}
          </div>
          <Tulip kind="pink" x={-85 * u} y={(size ? size.h : 400 * u) - 300 * u} height={360 * u} start={16} rotate={-14} />
          <Tulip kind="yellow" x={cardW - 130 * u} y={-250 * u} height={300 * u} start={22} rotate={16} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const titleWriteFrames = (title: string, fps: number) => 12 + writeDuration(title, fps);
