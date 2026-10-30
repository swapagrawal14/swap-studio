import React from 'react';
import {Img, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type TulipKind = 'pink' | 'yellow' | 'bunch';

/** Image-model tulip doodle that pops in and sways gently from its stem. */
export const Tulip: React.FC<{
  kind?: TulipKind;
  x: number; // left px
  y: number; // top px
  height: number;
  start?: number;
  rotate?: number;
  flip?: boolean;
  sway?: number;
  style?: React.CSSProperties;
}> = ({kind = 'pink', x, y, height, start = 0, rotate = 0, flip = false, sway = 3.5, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - start, fps, config: {damping: 10, stiffness: 140, mass: 0.8}});
  const s = Math.sin(((frame - start) / fps) * Math.PI * 1.1) * sway;
  return (
    <Img
      src={staticFile(`img/tulip_${kind}.png`)}
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
