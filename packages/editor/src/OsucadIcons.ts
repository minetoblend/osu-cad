import type { Texture } from 'pixi.js';
import { loadTexture } from 'osucad-framework';

const iconKeys = [
  'circle',
  'clap@2x',
  'cog',
  'finish@2x',
  'minus',
  'new-combo',
  'pause',
  'pen',
  'play',
  'plus',
  'redo',
  'reverse',
  'select',
  'select@2x',
  'size-ew',
  'size-ns',
  'slider',
  'slidershape-bird@2x',
  'slidershape-wave@2x',
  'slidershape-zwave@2x',
  'spinner',
  'undo',
  'whistle@2x',
  'logo-text',
  'grid@2x',
  'grid_empty@2x'
] as const;

export const OsucadIcons = new class OsucadIcons {
  #loadP: Promise<any> | null = null;

  #textures = new Map<typeof iconKeys[number], Texture>();

  load() {
    if (this.#loadP)
      return this.#loadP;

    this.#loadP = Promise.all(
      iconKeys.map(async (name) => {
        const texture = await loadTexture(new URL(`./assets/icons/${name}.png`, import.meta.url).href);
        if (!texture)
          throw new Error(`Failed to load icon: ${name}`);
        this.#textures.set(name, texture);
      }),
    );

    return this.#loadP;
  }

  get(name: typeof iconKeys[number]): Texture {
    return this.#textures.get(name)!;
  }
}();

export function getIcon(name: typeof iconKeys[number]): Texture {
  return OsucadIcons.get(name);
}
