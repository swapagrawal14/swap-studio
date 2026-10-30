import React from 'react';
import {Img, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {asset} from '../util';

export type TulipKind = 'pink' | 'yellow' | 'bunch';

/** A style pack's decoration image (image-model doodle) that pops in and sways gently from its base. `src` wins over `kind`. */
export const Tulip: React.FC<{
  kind?: TulipKind;
  src?: string;
  x: number; // left px
  y: number; // top px
  height: number;
  start?: number;
  rotate?: number;
  flip?: boolean;
  sway?: number;
  style?: React.CSSProperties;
}> = ({kind = 'pink', src, x, y, height, start = 0, rotate = 0, flip = false, sway = 3.5, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - start, fps, config: {damping: 10, stiffness: 140, mass: 0.8}});
  const s = Math.sin(((frame - start) / fps) * Math.PI * 1.1) * sway;
  return (
    <Img
      src={src ? asset(src)! : staticFile(`img/tulip_${kind}.png`)}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        height,
        transformOrigin: '50% 100%',
        transform: `${flip ? 'scaleX(-1) ' : ''}rotate(${rotate + s}deg) scale(${frame < start ? 0 : pop})`,
        ...style,
      }}
    />
  );
};

/** Decoration slot i of the pack (cycles through theme.decorations); renders nothing when the pack has none. */
export const Decoration: React.FC<Omit<React.ComponentProps<typeof Tulip>, 'src' | 'kind'> & {src?: string}> = ({src, ...rest}) =>
  src ? <Tulip src={src} {...rest} /> : null;
