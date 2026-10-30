import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, useVideoConfig} from 'remotion';
import {decoration, getTheme, INK, StyleInput, Theme} from '../theme';
import {useThemeFonts} from '../fonts';
import {asset} from '../util';
import {TitleCard, TitleCardProps} from '../components/TitleCard';
import {EndCard} from '../components/EndCard';
import {LowerThird} from '../components/LowerThird';
import {Word, WordCaptions} from '../components/WordCaptions';
import {FactBoard, FactLine, Paper} from '../components/FactBoard';
import {BrushWipe} from '../components/BrushWipe';
import {Sparkle} from '../components/Accents';
import {Decoration} from '../components/Tulip';

export type Common = {
  format?: '9:16' | '16:9';
  style?: StyleInput; // pack name or inline pack (see styles/README.md)
  channel?: 'edu' | 'ai'; // legacy alias: edu -> swap-edu, ai -> swap-ai
  theme?: Partial<Theme>; // low-level overrides on the resolved theme
};
const th = (p: Common) => {
  const t = getTheme(p.channel, p.theme, p.style);
  useThemeFonts(t);
  return t;
};
const F = (sec: number, fps: number) => Math.round(sec * fps);

// ---------- standalone pieces ----------
export type TitleCardComp = Common & TitleCardProps & {durationSec?: number};
export const TitleCardComposition: React.FC<TitleCardComp> = (p) => <TitleCard {...p} theme={th(p)} />;

export type EndCardComp = Common & {cta?: string; durationSec?: number};
export const EndCardComposition: React.FC<EndCardComp> = (p) => <EndCard theme={th(p)} cta={p.cta} />;

export type LowerThirdComp = Common & {title?: string; subtitle?: string; durationSec?: number; background?: string};
export const LowerThirdComposition: React.FC<LowerThirdComp> = (p) => {
  const {fps} = useVideoConfig();
  const t = th(p);
  return (
    <AbsoluteFill style={{background: p.background ?? INK}}>
      <LowerThird theme={t} title={p.title} subtitle={p.subtitle} durationInFrames={F(p.durationSec ?? 4, fps)} />
    </AbsoluteFill>
  );
};

export type CaptionsComp = Common & {words: Word[]; audio?: string; background?: string; durationSec?: number};
export const CaptionsComposition: React.FC<CaptionsComp> = (p) => {
  const t = th(p);
  return (
    <AbsoluteFill style={{background: p.background ?? t.bg}}>
      {p.audio && <Audio src={asset(p.audio)!} />}
      <WordCaptions words={p.words || []} theme={t} />
    </AbsoluteFill>
  );
};

// ---------- branded showcase: title -> fact board w/ captions + lower third -> end card ----------
export type ShowcaseComp = Common &
  TitleCardProps & {
    lines: FactLine[]; // `at` seconds relative to content start
    words?: Word[];
    audio?: string;
    voiceDelaySec?: number;
    titleSec?: number;
    contentSec?: number;
    endSec?: number;
    cta?: string;
    lowerThird?: {title?: string; subtitle?: string; sec?: number} | false;
  };
export const showcaseFrames = (p: ShowcaseComp, fps: number) => {
  const a = F(p.titleSec ?? 3.5, fps), b = F(p.contentSec ?? 5.5, fps), c = F(p.endSec ?? 3, fps);
  return {a, b, c, total: a + b + c};
};
export const BrandShowcase: React.FC<ShowcaseComp> = (p) => {
  const {fps, width, height} = useVideoConfig();
  const t = th(p);
  const u = Math.min(width, height) / 1080;
  const portrait = height > width;
  const {a, b, c} = showcaseFrames(p, fps);
  const vd = F(p.voiceDelaySec ?? 0.3, fps);
  return (
    <AbsoluteFill style={{background: t.bg}}>
      <Sequence durationInFrames={a + 2} name="Title">
        <TitleCard title={p.title} highlight={p.highlight} kicker={p.kicker} subtitle={p.subtitle} theme={t} />
      </Sequence>
      <Sequence from={a} durationInFrames={b + 2} name="Content">
        <AbsoluteFill style={{overflow: 'hidden'}}>
          <Paper theme={t} />
          <FactBoard lines={p.lines} theme={t} />
          <Decoration src={decoration(t, 1)} x={width - (portrait ? 250 : 260) * u} y={height - 330 * u} height={330 * u} start={4} rotate={-10} />
          <Decoration src={decoration(t, 0)} x={-30 * u} y={height - 300 * u} height={290 * u} start={8} rotate={12} flip />
          {t.sparkles && (
            <>
              <Sparkle x={width - 120 * u} y={120 * u} size={70 * u} color={t.accent} outline={t.sparkleOutline} start={6} seed={71} clean={t.accents !== 'rough'} />
              <Sparkle x={110 * u} y={(portrait ? 150 : 110) * u} size={52 * u} color={t.sun === t.accent || t.sun === 'none' ? '#FFFFFF' : t.sun} outline={t.sparkleOutline} start={10} seed={72} clean={t.accents !== 'rough'} />
            </>
          )}
          {p.lowerThird !== false && (
            <Sequence from={F(0.4, fps)} durationInFrames={F((p.lowerThird && p.lowerThird.sec) || 3, fps)}>
              <LowerThird theme={t} title={p.lowerThird ? p.lowerThird.title : undefined} subtitle={p.lowerThird ? p.lowerThird.subtitle : undefined} durationInFrames={F((p.lowerThird && p.lowerThird.sec) || 3, fps)} />
            </Sequence>
          )}
          {p.words && (
            <Sequence from={vd}>
              <WordCaptions words={p.words} theme={t} />
            </Sequence>
          )}
        </AbsoluteFill>
      </Sequence>
      {p.audio && (
        <Sequence from={a + vd} name="Voice">
          <Audio src={asset(p.audio)!} />
        </Sequence>
      )}
      <Sequence from={a + b} durationInFrames={c} name="End">
        <EndCard theme={t} cta={p.cta} />
      </Sequence>
      <BrushWipe at={a} color={t.wipe} outline={t.wipeOutline} clean={t.accents !== 'rough'} />
      <BrushWipe at={a + b} color={t.wipe2} seed={9} outline={t.wipeOutline} clean={t.accents !== 'rough'} />
    </AbsoluteFill>
  );
};

// ---------- intro + outro only (channel bumper) ----------
export type IntroOutroComp = Common & TitleCardProps & {titleSec?: number; endSec?: number; cta?: string};
export const IntroOutro: React.FC<IntroOutroComp> = (p) => {
  const {fps} = useVideoConfig();
  const t = th(p);
  const a = F(p.titleSec ?? 4, fps), c = F(p.endSec ?? 4, fps);
  return (
    <AbsoluteFill style={{background: t.bg}}>
      <Sequence durationInFrames={a + 2}>
        <TitleCard title={p.title} highlight={p.highlight} kicker={p.kicker} subtitle={p.subtitle} theme={t} />
      </Sequence>
      <Sequence from={a} durationInFrames={c}>
        <EndCard theme={t} cta={p.cta} />
      </Sequence>
      <BrushWipe at={a} color={t.wipe} outline={t.wipeOutline} clean={t.accents !== 'rough'} />
    </AbsoluteFill>
  );
};

// ---------- SwapDraws MP4 wrapped in branded intro + outro ----------
export type SwapDrawsClipComp = Common &
  TitleCardProps & {video: string; videoDurationSec?: number; introSec?: number; endSec?: number; cta?: string; lowerThird?: boolean; volume?: number};
export const swapDrawsFrames = (p: SwapDrawsClipComp, fps: number) => {
  const a = F(p.introSec ?? 3, fps), v = F(p.videoDurationSec ?? 10, fps), c = F(p.endSec ?? 4, fps);
  return {a, v, c, total: a + v + c};
};
export const SwapDrawsClip: React.FC<SwapDrawsClipComp> = (p) => {
  const {fps} = useVideoConfig();
  const t = th(p);
  const {a, v, c} = swapDrawsFrames(p, fps);
  return (
    <AbsoluteFill style={{background: t.bg}}>
      <Sequence durationInFrames={a + 2}>
        <TitleCard title={p.title} highlight={p.highlight} kicker={p.kicker} subtitle={p.subtitle} theme={t} />
      </Sequence>
      <Sequence from={a} durationInFrames={v}>
        <AbsoluteFill style={{background: '#FFFFFF'}}>
          <OffthreadVideo src={asset(p.video)!} volume={p.volume ?? 1} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
        </AbsoluteFill>
        {p.lowerThird !== false && (
          <Sequence from={F(0.6, fps)} durationInFrames={F(3.2, fps)}>
            <LowerThird theme={t} durationInFrames={F(3.2, fps)} />
          </Sequence>
        )}
      </Sequence>
      <Sequence from={a + v} durationInFrames={c}>
        <EndCard theme={t} cta={p.cta} />
      </Sequence>
      <BrushWipe at={a} color={t.wipe} outline={t.wipeOutline} clean={t.accents !== 'rough'} />
      <BrushWipe at={a + v} color={t.wipe} seed={9} outline={t.wipeOutline} clean={t.accents !== 'rough'} />
    </AbsoluteFill>
  );
};
