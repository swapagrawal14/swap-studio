import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {decoration, Theme} from '../theme';
import {clamp, useMeasure} from '../util';
import {roughRect, RoughPaths} from '../rough';
import {Sparkle} from './Accents';
import {Decoration} from './Tulip';
import {WriteOnText, writeDuration} from './WriteOnText';

export type TitleCardProps = {
  title: string;
  highlight?: string;
  kicker?: string; // small tag above the card, defaults to the pack's kicker / channel name
  subtitle?: string;
};

/** Paper card on the pack's background with a big sun circle; the title writes itself in, decorations pop, sparkles twinkle. */
export const TitleCard: React.FC<TitleCardProps & {theme: Theme}> = ({title, highlight, kicker, subtitle, theme}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const portrait = height > width;
  const u = Math.min(width, height) / 1080;
  const rough = theme.accents === 'rough';
  const tl = theme.tilt;
  const {title: tf, body: bf, label: lf} = theme.fonts;
  const cardW = portrait ? 900 * u : 1320 * u;
  const titleSize = (portrait ? 150 : 140) * u * tf.scale;
  const writeStart = 12;
  const wd = writeDuration(title, fps);
  const sunPop = spring({frame, fps, config: {damping: 14, stiffness: 90}});
  const cardPop = spring({frame: frame - 3, fps, config: {damping: 12, stiffness: 120}});
  const tagPop = spring({frame: frame - 8, fps, config: {damping: 9, stiffness: 160}});
  const subOp = clamp((frame - writeStart - wd) / 10);
  const [ref, size] = useMeasure<HTMLDivElement>();
  const outline = size && rough
    ? roughRect(6, 6, size.w - 12, size.h - 12, {stroke: theme.ink, strokeWidth: 9 * u, roughness: 1.4, bowing: 1.2, seed: 21})
    : [];
  const shadow = size && rough
    ? roughRect(6, 6, size.w - 12, size.h - 12, {fill: theme.shadow, fillStyle: 'solid', stroke: 'none', roughness: 1.2, seed: 22})
    : [];
  const sunD = (portrait ? 980 : 900) * u;
  const cx = width / 2, cy = height / 2;
  const sparkles = portrait
    ? [[150, 300], [930, 420], [120, 1500], [960, 1580], [880, 230], [200, 1690]]
    : [[220, 160], [1720, 200], [160, 900], [1760, 880], [1500, 120], [400, 960]];
  const r = theme.radius * u;
  const glow = theme.glow ? `, 0 0 ${60 * u}px ${theme.accent}66` : '';
  const cleanCard: React.CSSProperties = rough
    ? {}
    : {border: `${8 * u}px solid ${theme.ink}`, borderRadius: r, boxShadow: `${16 * u}px ${18 * u}px 0 ${theme.shadow}${glow}`};
  const deco0 = decoration(theme, 0), deco1 = decoration(theme, 1);
  return (
    <AbsoluteFill style={{background: theme.bg, overflow: 'hidden'}}>
      {/* sun circle, like the avatar */}
      {theme.sun !== 'none' && (
        <div
          style={{
            position: 'absolute', left: cx - sunD / 2, top: cy - sunD / 2, width: sunD, height: sunD, borderRadius: '50%',
            background: theme.sun, transform: `scale(${sunPop})`, opacity: 0.95,
          }}
        />
      )}
      {theme.sparkles && sparkles.map(([x, y], i) => (
        <Sparkle key={i} x={x * (portrait ? u : u)} y={y * u} size={(i % 2 ? 54 : 78) * u} start={6 + i * 4} seed={i + 1} color={i % 3 === 2 ? theme.accent2 : theme.sparkle} outline={theme.sparkleOutline} clean={!rough} />
      ))}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: cardW, transform: `rotate(${-2 * tl}deg) scale(${cardPop})`}}>
          {/* channel tag */}
          <div
            style={{
              position: 'absolute', top: -58 * u, left: 40 * u, zIndex: 3, transform: `rotate(${-5 * tl}deg) scale(${tagPop})`, transformOrigin: 'left center',
              background: theme.accent, border: `${6 * u}px solid ${theme.ink}`,
              borderRadius: rough ? `${18 * u}px ${10 * u}px ${22 * u}px ${12 * u}px` : Math.min(r, 40 * u),
              padding: `${8 * u}px ${28 * u}px`, fontFamily: lf.css, fontWeight: lf.weight, fontSize: 46 * u * lf.scale, color: theme.tagText, whiteSpace: 'nowrap',
              boxShadow: `${6 * u}px ${6 * u}px 0 ${rough ? theme.ink : theme.shadow}`,
            }}
          >
            {kicker || theme.channel}
          </div>
          {size && rough && (
            <svg width={size.w} height={size.h} style={{position: 'absolute', left: 16 * u, top: 18 * u, overflow: 'visible'}}>
              <RoughPaths paths={shadow} progress={1} />
            </svg>
          )}
          <div ref={ref} style={{position: 'relative', background: theme.paper, borderRadius: 14 * u, padding: `${80 * u}px ${60 * u}px ${64 * u}px`, textAlign: 'center', ...cleanCard}}>
            {size && rough && (
              <svg width={size.w} height={size.h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                <RoughPaths paths={outline} progress={1} />
              </svg>
            )}
            <WriteOnText
              text={title} start={writeStart} fontSize={titleSize} highlight={highlight} highlightColor={theme.highlight} lineHeight={rough ? 1.02 : 1.08}
              fontFamily={tf.css} fontWeight={tf.weight as number} color={theme.ink} wiggle={1.6 * tl} highlightText={theme.highlightText} cleanHighlight={!rough}
              style={theme.glow ? {textShadow: `0 0 ${24 * u}px ${theme.accent}AA`} : undefined}
            />
            {subtitle && (
              <div style={{fontFamily: bf.css, fontWeight: bf.weight, fontSize: 54 * u * bf.scale, color: theme.ink, marginTop: 22 * u, opacity: subOp, transform: `translateY(${(1 - subOp) * 16 * u}px)`}}>
                {subtitle}
              </div>
            )}
          </div>
          <Decoration src={deco0} x={-85 * u} y={(size ? size.h : 400 * u) - 300 * u} height={360 * u} start={16} rotate={-14} />
          <Decoration src={deco1} x={cardW - 130 * u} y={-250 * u} height={300 * u} start={22} rotate={16} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const titleWriteFrames = (title: string, fps: number) => 12 + writeDuration(title, fps);
