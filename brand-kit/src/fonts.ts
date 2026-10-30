import {continueRender, delayRender, staticFile} from 'remotion';

const FACES: [string, string, string][] = [
  ['Caveat', 'fonts/Caveat-700-normal.woff2', '700'],
  ['Permanent Marker', 'fonts/PermanentMarker-400-normal.woff2', '400'],
  ['Patrick Hand', 'fonts/PatrickHand-400-normal.woff2', '400'],
];

let promise: Promise<void> | null = null;
export const fontsReady = (): Promise<void> => {
  if (promise) return promise;
  if (typeof document === 'undefined') return Promise.resolve();
  const handle = delayRender('brand fonts');
  promise = Promise.all(
    FACES.map(([family, file, weight]) => {
      const f = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, {weight});
      return f.load().then((loaded) => {
        document.fonts.add(loaded);
      });
    }),
  )
    .then(() => undefined)
    .catch((e) => {
      console.error('font load failed', e);
    })
    .finally(() => continueRender(handle));
  return promise;
};
