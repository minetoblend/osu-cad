import { Assets, AssetsManifest } from 'pixi.js';
import { skinBundle } from './assets/skin.ts';
import spriteSheetUrl from '@/assets/spritesheet.json?url';
import spriteSheetPngUrl from '@/assets/spritesheet.png?url';

const manifest: AssetsManifest = {
  bundles: [skinBundle('skin')],
};

export async function createEditorTextures() {
  Assets.reset();
  await Assets.init({
    basePath: '/assets',
    manifest,
  });
  await Assets.loadBundle(['osu-skin']);

  const spritesheet = await Assets.load({
    src: spriteSheetUrl,
    data: {
      texture: await Assets.load(spriteSheetPngUrl),
    },
  });
  for (const [name, texture] of Object.entries(spritesheet.textures)) {
    Assets.cache.set(name, texture);
  }
}
