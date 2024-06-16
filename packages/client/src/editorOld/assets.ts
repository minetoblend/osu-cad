import { Assets } from 'pixi.js';
import fontUrl from '@fontsource/nunito-sans/files/nunito-sans-latin-400-normal.woff2';
import { Beatmap, DeferredPromise } from '@osucad/common';
import { skinBundle } from '@/editorOld/assets/skin.ts';
import spriteSheetUrl from '@/assets/spritesheet.json?url';
import spriteSheetPngUrl from '@/assets/spritesheet.png?url';

export async function loadAssets() {
  Assets.reset();
  await Assets.init({
    basePath: '/assets',
  });

  const deferred = new DeferredPromise();
  deferred.add(loadFonts());
  deferred.add(loadIcons());
  deferred.add(loadSkin());
}

export async function loadSkin() {
  Assets.addBundle('skin', skinBundle('skin').assets);

  try {
    console.log('loading skin');
    await Assets.loadBundle('skin');
    console.log('skin loaded');
  } catch (e) {
    console.error('failed to load skin:', e);
    throw e;
  }
}

export async function loadIcons() {
  console.log('loading icons');
  try {
    const spritesheet = await Assets.load({
      src: spriteSheetUrl,
      data: {
        texture: await Assets.load(spriteSheetPngUrl),
      },
    });
    for (const [name, texture] of Object.entries(spritesheet.textures)) {
      Assets.cache.set(name, texture);
    }
    console.log('icons loaded');
  } catch (e) {
    console.error('Failed to load icons:', e);
    throw e;
  }
}

export async function loadBackgorund(beatmap: Beatmap) {
  if (!beatmap.backgroundPath) {
    return;
  }
  console.log('loading background');
  try {
    await Assets.load(
      `/api/mapsets/${beatmap.setId}/files/${beatmap.backgroundPath}`,
    );
    console.log('background loaded');
  } catch (e) {
    console.error('Failed to load background:', e);
  }
}

export async function loadFonts() {
  try {
    Assets.addBundle('fonts', [
      {
        alias: 'Nunito Sans',
        src: fontUrl,
      },
    ]);
  } catch (e) {
    console.error('Failed to load fonts:', e);
  }
}
