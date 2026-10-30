import React from 'react';
import {CalculateMetadataFunction, Composition} from 'remotion';
import {dims} from './theme';
import {fontsReady} from './fonts';
import {
  BrandShowcase, CaptionsComposition, EndCardComposition, IntroOutro, LowerThirdComposition, showcaseFrames, SwapDrawsClip,
  swapDrawsFrames, TitleCardComposition,
} from './compositions';

fontsReady();
const FPS = 30;

const meta = (frames: (p: any) => number): CalculateMetadataFunction<any> => ({props}) => ({
  ...dims(props.format),
  durationInFrames: Math.max(1, frames(props)),
  fps: FPS,
});
const sec = (d: number) => (p: any) => Math.round((p.durationSec ?? d) * FPS);

const edu = {channel: 'edu', format: '9:16'};

export const Root: React.FC = () => (
  <>
    <Composition id="TitleCard" component={TitleCardComposition as any} width={1080} height={1920} fps={FPS} durationInFrames={105}
      defaultProps={{...edu, title: 'Why sugar melts your teeth', highlight: 'melts', subtitle: 'the 60-second version'}} calculateMetadata={meta(sec(3.5))} />
    <Composition id="EndCard" component={EndCardComposition as any} width={1080} height={1920} fps={FPS} durationInFrames={120}
      defaultProps={{...edu}} calculateMetadata={meta(sec(4))} />
    <Composition id="LowerThird" component={LowerThirdComposition as any} width={1080} height={1920} fps={FPS} durationInFrames={120}
      defaultProps={{...edu}} calculateMetadata={meta(sec(4))} />
    <Composition id="WordCaptions" component={CaptionsComposition as any} width={1080} height={1920} fps={FPS} durationInFrames={120}
      defaultProps={{...edu, words: [{word: 'Dude,', start: 0.1, end: 0.6}, {word: 'brush', start: 0.7, end: 1.1}, {word: 'twice!', start: 1.2, end: 1.8}]}}
      calculateMetadata={meta((p) => Math.round((p.durationSec ?? Math.max(2, (p.words?.[p.words.length - 1]?.end ?? 2) + 0.8)) * FPS))} />
    <Composition id="BrandShowcase" component={BrandShowcase as any} width={1080} height={1920} fps={FPS} durationInFrames={360}
      defaultProps={{...edu, title: 'Why sugar melts your teeth', highlight: 'melts', lines: []}} calculateMetadata={meta((p) => showcaseFrames(p, FPS).total)} />
    <Composition id="IntroOutro" component={IntroOutro as any} width={1920} height={1080} fps={FPS} durationInFrames={240}
      defaultProps={{channel: 'ai', format: '16:9', title: 'I tested 5 free AI video tools', highlight: 'free'}}
      calculateMetadata={meta((p) => Math.round(((p.titleSec ?? 4) + (p.endSec ?? 4)) * FPS))} />
    <Composition id="SwapDrawsClip" component={SwapDrawsClip as any} width={1080} height={1920} fps={FPS} durationInFrames={510}
      defaultProps={{...edu, title: 'How a cavity forms', video: ''}} calculateMetadata={meta((p) => swapDrawsFrames(p, FPS).total)} />
  </>
);
