import { AssetsBundle } from 'pixi.js';
import { withBasePath } from './basePath.ts';

export function skinBundle(skinPath: string = ''): AssetsBundle {
  const bundle: AssetsBundle = {
    name: 'osu-skin',
    assets: [
      {
        alias: 'hitcircle',
        src: ['hitcircle@2x.png', 'hitcircle.png'],
        loadParser: 'loadTextures',
        data: { autoGenerateMipmaps: true },
      },
      {
        alias: 'hitcircleoverlay',
        src: [
          'hitcircleoverlay@2x.png',
          // "hitcircleoverlay.png",
        ],
        data: { autoGenerateMipmaps: true },
      },
      {
        alias: 'approachcircle',
        src: ['approachcircle@2x.png', 'approachcircle.png'],
      },
      {
        alias: 'followpoint',
        src: ['followpoint.png'],
      },
      {
        alias: 'cursor',
        src: ['cursor.png'],
      },
      {
        alias: 'cursor-smoke',
        src: ['cursor-smoke.png'],
      },
      {
        alias: 'cursortrail',
        src: ['cursortrail.png'],
      },
      {
        alias: 'hitcircleselect',
        src: ['hitcircleselect@2x.png', 'hitcircleselect.png'],
      },
      {
        alias: 'reversearrow',
        src: ['reversearrow@2x.png', 'reversearrow.png'],
      },
      {
        alias: 'sliderb0',
        src: ['sliderb0.png'],
      },
      {
        alias: 'sliderfollowcircle',
        src: ['sliderfollowcircle.png'],
      },
      {
        alias: 'spinner-approachcircle',
        src: ['spinner-approachcircle@2x.png', 'spinner-approachcircle.png'],
      },
      {
        alias: 'spinner-background',
        src: ['spinner-background@2x.png', 'spinner-background.png'],
      },
      {
        alias: 'spinner-bottom',
        src: ['spinner-bottom@2x.png', 'spinner-bottom.png'],
      },
      {
        alias: 'spinner-circle',
        src: ['spinner-circle@2x.png', 'spinner-circle.png'],
      },
      {
        alias: 'spinner-clear',
        src: ['spinner-clear@2x.png', 'spinner-clear.png'],
      },
      {
        alias: 'spinner-glow',
        src: ['spinner-glow@2x.png', 'spinner-glow.png'],
      },
      {
        alias: 'spinner-middle',
        src: ['spinner-middle@2x.png', 'spinner-middle.png'],
      },
      {
        alias: 'spinner-top',
        src: ['spinner-top@2x.png', 'spinner-top.png'],
      },
      {
        alias: 'hitmarker',
        src: ['hitmarker@2x.png'],
      },
      ...Array.from({ length: 10 }, (_, i) => ({
        alias: `default-${i}`,
        src: [`default-${i}@2x.png`],
      })),
    ],
  };

  return withBasePath(skinPath, bundle);
}
