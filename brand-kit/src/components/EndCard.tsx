import React from 'react';
import {AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, INK, Theme} from '../theme';
import {useMeasure} from '../util';
import {roughCircle, roughRect, RoughPaths} from '../rough';
import {HighlightSwipe, Sparkle, WobblyUnderline} from './Accents';
import {Tulip} from './Tulip';
import {WriteOnText} from './WriteOnText';

/** Follow CTA: avatar in a hand-drawn ring, CTA writes in, name + handle, tulip bunch. Always credits theme.credit. */
export const EndCard: React.FC<{theme: Theme; cta?: string; avatar?: string}> = ({theme, cta, avatar}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const portrait = height > width;
  const u = Math.min(width, height) / 1080;
  const av = (portrait ? 520 : 500) * u;
  const avPop = spring({frame, fps, config: {damping: 11, stiffness: 120}});
  const namePop = spring({frame: frame - 26, fps, config: {damping: 11, stiffness: 150}});
  const handlePop = spring({frame: frame - 34, fps, config: {damping: 9, stiffness: 170}});
  const btnPop = spring({frame: frame - 44, fps, config: {damping: 8, stiffness: 170}});
  const pulse = 1 + 0.04 * Math.max(0, Math.sin((frame - 50) / 5));
  const ring = roughCircle(av / 2, av / 2, av, {stroke: theme.id === 'ai' ? theme.paper : INK, strokeWidth: 12 * u, roughness: 1.2, seed: 51});
  const ringProg = Math.min(1, frame / 16);
  const [bref, bsize] = useMeasure<HTMLDivElement>();
  const btn = bsize ? roughRect(4, 4, bsize.w - 8, bsize.h - 8, {fill: theme.id === 'ai' ? theme.accent2 : theme.accent, fillStyle: 'solid', stroke: INK, strokeWidth: 7 * u, roughness: 1.4, seed: 52}) : [];
  const btnShadow = bsize ? roughRect(4, 4, bsize.w - 8, bsize.h - 8, {fill: INK, fillStyle: 'solid', stroke: 'none', roughness: 1.2, seed: 53}) : [];
  const ctaText = cta || theme.cta;
  const ctaColor = theme.textOnBg;
  const sparkles = portrait
    ? [[140, 260], [940, 330], [110, 1180], [980, 1080], [200, 1720], [900, 1760]]
    : [[120, 140], [1800, 170], [1000, 90], [1820, 960], [110, 960], [860, 1000]];

  const avatarBlock = (
    <div style={{position: 'relative', width: av, height: av, transform: `scale(${avPop}) rotate(${-3 + avPop * 3}deg)`, flex: 'none'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', background: theme.sun}}>
        <Img src={avatar || staticFile('img/avatar.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <svg width={av} height={av} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <RoughPaths paths={ring} progress={ringProg} />
      </svg>
      <Tulip kind="bunch" x={av * 0.6} y={av * 0.52} height={av * 0.52} start={14} rotate={12} />
    </div>
  );

  const textBlock = (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: portrait ? 'center' : 'flex-start', textAlign: portrait ? 'center' : 'left', maxWidth: portrait ? 960 * u : 1060 * u}}>
      <WriteOnText
        text={ctaText}
        start={10}
        cps={26}
        fontSize={(portrait ? 98 : 96) * u}
        color={ctaColor}
        strokeColor={INK}
        strokeWidth={theme.id === 'ai' ? 0 : 10 * u}
        lineHeight={1.0}
        style={{textShadow: theme.id === 'ai' ? 'none' : `${5 * u}px ${6 * u}px 0 ${INK}`}}
      />
      <div style={{marginTop: 30 * u, transform: `scale(${namePop})`, transformOrigin: portrait ? 'center' : 'left center'}}>
        <WobblyUnderline start={40} duration={12} color={theme.id === 'ai' ? theme.accent : INK} thickness={9 * u} seed={61}>
          <span
            style={{
              fontFamily: FONT.marker, fontSize: (portrait ? 92 : 88) * u, color: '#FFFFFF', whiteSpace: 'nowrap',
              WebkitTextStroke: `${12 * u}px ${INK}`, paintOrder: 'stroke fill', textShadow: `${6 * u}px ${7 * u}px 0 ${INK}`,
            }}
          >
            {theme.credit}
          </span>
        </WobblyUnderline>
      </div>
      <div style={{marginTop: 26 * u, transform: `scale(${handlePop})`, transformOrigin: portrait ? 'center' : 'left center', display: 'flex', alignItems: 'center', gap: 24 * u, flexDirection: portrait ? 'column' : 'row'}}>
        <div style={{fontFamily: FONT.marker, fontSize: 64 * u, color: INK, background: theme.paper, padding: `${6 * u}px ${30 * u}px`, borderRadius: `${30 * u}px ${18 * u}px ${34 * u}px ${20 * u}px`, border: `${6 * u}px solid ${INK}`, whiteSpace: 'nowrap', boxShadow: `${7 * u}px ${7 * u}px 0 ${INK}`}}>
          {theme.handle}
        </div>
        <div style={{fontFamily: FONT.hand, fontSize: 54 * u, color: theme.textOnBg, whiteSpace: 'nowrap'}}>{theme.channel}</div>
      </div>
      <div style={{position: 'relative', marginTop: 44 * u, transform: `scale(${btnPop * pulse}) rotate(-2deg)`, transformOrigin: portrait ? 'center' : 'left center'}}>
        {bsize && (
          <svg width={bsize.w} height={bsize.h} style={{position: 'absolute', left: 10 * u, top: 12 * u, overflow: 'visible'}}>
            <RoughPaths paths={btnShadow} />
          </svg>
        )}
        <div ref={bref} style={{position: 'relative', padding: `${14 * u}px ${56 * u}px`, fontFamily: FONT.marker, fontSize: 62 * u, color: INK, whiteSpace: 'nowrap'}}>
          {bsize && (
            <svg width={bsize.w} height={bsize.h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <RoughPaths paths={btn} />
            </svg>
          )}
          <span style={{position: 'relative'}}>+ Follow</span>
        </div>
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{background: theme.bg, overflow: 'hidden'}}>
      {sparkles.map(([x, y], i) => (
        <Sparkle key={i} x={x * u} y={y * u} size={(i % 2 ? 56 : 80) * u} start={4 + i * 5} seed={i + 9} color={i % 3 === 1 ? theme.accent2 : '#FFFFFF'} />
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
