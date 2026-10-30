import React from 'react';
import {AbsoluteFill, Img, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {decoration, ro, Theme} from '../theme';
import {asset, useMeasure} from '../util';
import {roughCircle, roughRect, RoughPaths} from '../rough';
import {Sparkle, WobblyUnderline} from './Accents';
import {Decoration} from './Tulip';
import {WriteOnText} from './WriteOnText';

const initials = (name: string) =>
  name.replace(/^(dr|mr|ms|mrs)\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '★';

/** Follow CTA: avatar (or initials) in a ring, CTA writes in, name + handle, decoration. Credits the pack's endCard.name. */
export const EndCard: React.FC<{theme: Theme; cta?: string; avatar?: string}> = ({theme, cta, avatar}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const portrait = height > width;
  const u = Math.min(width, height) / 1080;
  const rough = theme.accents === 'rough';
  const tl = theme.tilt;
  const {title: tf, body: bf, label: lf} = theme.fonts;
  const av = (portrait ? 520 : 500) * u;
  const avPop = spring({frame, fps, config: {damping: 11, stiffness: 120}});
  const namePop = spring({frame: frame - 26, fps, config: {damping: 11, stiffness: 150}});
  const handlePop = spring({frame: frame - 34, fps, config: {damping: 9, stiffness: 170}});
  const btnPop = spring({frame: frame - 44, fps, config: {damping: 8, stiffness: 170}});
  const pulse = 1 + 0.04 * Math.max(0, Math.sin((frame - 50) / 5));
  const ring = roughCircle(av / 2, av / 2, av, ro(theme, {stroke: theme.ring, strokeWidth: 12 * u, roughness: 1.2, seed: 51}));
  const ringProg = Math.min(1, frame / 16);
  const [bref, bsize] = useMeasure<HTMLDivElement>();
  const btn = bsize && rough ? roughRect(4, 4, bsize.w - 8, bsize.h - 8, {fill: theme.highlight, fillStyle: 'solid', stroke: theme.ink, strokeWidth: 7 * u, roughness: 1.4, seed: 52}) : [];
  const btnShadow = bsize && rough ? roughRect(4, 4, bsize.w - 8, bsize.h - 8, {fill: theme.ink, fillStyle: 'solid', stroke: 'none', roughness: 1.2, seed: 53}) : [];
  const ctaText = cta || theme.cta;
  const ctaColor = theme.textOnBg;
  const r = theme.radius * u;
  const avSrc = avatar ? avatar : theme.avatar ? asset(theme.avatar) : undefined;
  const sparkles = portrait
    ? [[140, 260], [940, 330], [110, 1180], [980, 1080], [200, 1720], [900, 1760]]
    : [[120, 140], [1800, 170], [1000, 90], [1820, 960], [110, 960], [860, 1000]];

  const avatarBlock = (
    <div style={{position: 'relative', width: av, height: av, transform: `scale(${avPop}) rotate(${(-3 + avPop * 3) * tl}deg)`, flex: 'none'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', background: !avSrc || theme.sun === 'none' ? theme.accent : theme.sun}}>
        {avSrc ? (
          <Img src={avSrc} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: lf.css, fontWeight: lf.weight, fontSize: av * 0.36 * lf.scale, color: theme.tagText}}>
            {initials(theme.credit)}
          </div>
        )}
      </div>
      <svg width={av} height={av} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <RoughPaths paths={ring} progress={ringProg} />
      </svg>
      <Decoration src={decoration(theme, 2)} x={av * 0.6} y={av * 0.52} height={av * 0.52} start={14} rotate={12} />
    </div>
  );

  const nameStyle: React.CSSProperties = rough
    ? {color: theme.sticker, WebkitTextStroke: `${12 * u}px ${theme.stickerStroke}`, paintOrder: 'stroke fill', textShadow: `${6 * u}px ${7 * u}px 0 ${theme.stickerStroke}`}
    : {color: theme.textOnBg, textShadow: theme.glow ? `0 0 ${22 * u}px ${theme.accent}` : undefined};
  const nameEl = (
    <span style={{fontFamily: lf.css, fontWeight: lf.weight, fontSize: (portrait ? 92 : 88) * u * lf.scale, whiteSpace: 'nowrap', ...nameStyle}}>
      {theme.credit}
    </span>
  );

  const textBlock = (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: portrait ? 'center' : 'flex-start', textAlign: portrait ? 'center' : 'left', maxWidth: portrait ? 960 * u : 1060 * u}}>
      <WriteOnText
        text={ctaText}
        start={10}
        cps={26}
        fontFamily={tf.css}
        fontWeight={tf.weight as number}
        fontSize={(portrait ? 98 : 96) * u * tf.scale}
        color={ctaColor}
        strokeColor={theme.stickerStroke}
        strokeWidth={theme.ctaOutline ? 10 * u : 0}
        lineHeight={rough ? 1.0 : 1.1}
        wiggle={1.6 * tl}
        style={{textShadow: theme.ctaOutline ? `${5 * u}px ${6 * u}px 0 ${theme.stickerStroke}` : 'none'}}
      />
      <div style={{marginTop: 30 * u, transform: `scale(${namePop})`, transformOrigin: portrait ? 'center' : 'left center'}}>
        {theme.accents === 'none' ? nameEl : (
          <WobblyUnderline start={40} duration={12} color={theme.underline} thickness={9 * u} seed={61} clean={!rough}>
            {nameEl}
          </WobblyUnderline>
        )}
      </div>
      <div style={{marginTop: 26 * u, transform: `scale(${handlePop})`, transformOrigin: portrait ? 'center' : 'left center', display: 'flex', alignItems: 'center', gap: 24 * u, flexDirection: portrait ? 'column' : 'row'}}>
        <div style={{fontFamily: lf.css, fontWeight: lf.weight, fontSize: 64 * u * lf.scale, color: theme.ink, background: theme.paper, padding: `${6 * u}px ${30 * u}px`, borderRadius: rough ? `${30 * u}px ${18 * u}px ${34 * u}px ${20 * u}px` : Math.min(r, 40 * u), border: `${6 * u}px solid ${theme.ink}`, whiteSpace: 'nowrap', boxShadow: `${7 * u}px ${7 * u}px 0 ${rough ? theme.ink : theme.shadow}`}}>
          {theme.handle}
        </div>
        <div style={{fontFamily: bf.css, fontWeight: bf.weight, fontSize: 54 * u * bf.scale, color: theme.textOnBg, whiteSpace: 'nowrap'}}>{theme.channel}</div>
      </div>
      <div style={{position: 'relative', marginTop: 44 * u, transform: `scale(${btnPop * pulse}) rotate(${-2 * tl}deg)`, transformOrigin: portrait ? 'center' : 'left center'}}>
        {bsize && rough && (
          <svg width={bsize.w} height={bsize.h} style={{position: 'absolute', left: 10 * u, top: 12 * u, overflow: 'visible'}}>
            <RoughPaths paths={btnShadow} />
          </svg>
        )}
        <div
          ref={bref}
          style={{
            position: 'relative', padding: `${14 * u}px ${56 * u}px`, fontFamily: lf.css, fontWeight: lf.weight, fontSize: 62 * u * lf.scale, color: theme.highlightText ?? theme.ink, whiteSpace: 'nowrap',
            ...(rough ? {} : {background: theme.highlight, border: `${7 * u}px solid ${theme.ink}`, borderRadius: Math.min(r, 60 * u), boxShadow: `${10 * u}px ${12 * u}px 0 ${theme.shadow}`}),
          }}
        >
          {bsize && rough && (
            <svg width={bsize.w} height={bsize.h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <RoughPaths paths={btn} />
            </svg>
          )}
          <span style={{position: 'relative'}}>{theme.button}</span>
        </div>
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{background: theme.bg, overflow: 'hidden'}}>
      {theme.sparkles && sparkles.map(([x, y], i) => (
        <Sparkle key={i} x={x * u} y={y * u} size={(i % 2 ? 56 : 80) * u} start={4 + i * 5} seed={i + 9} color={i % 3 === 1 ? theme.accent2 : theme.sparkle} outline={theme.sparkleOutline} clean={!rough} />
      ))}
      <AbsoluteFill
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: portrait ? 'column' : 'row', gap: (portrait ? 70 : 110) * u, padding: portrait ? `0 ${60 * u}px` : `0 ${120 * u}px`,
        }}
      >
        {avatarBlock}
        {textBlock}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
