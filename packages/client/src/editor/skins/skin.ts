import { Assets, Texture } from 'pixi.js';

export type TextureKeys = 'hitcircle' | 'hitcircleoverlay' | 'approachcircle';

export class Skin {
  textureUrls: {
    [key in TextureKeys]: string;
  } = {
    hitcircle: '/assets/skin/hitcircle@2x.png',
    hitcircleoverlay: '/assets/skin/hitcircleoverlay@2x.png',
    approachcircle: '/assets/skin/approachcircle@2x.png',
  };

  textures: {
    [key in TextureKeys]: Texture;
  } = {
    hitcircle: Texture.EMPTY,
    hitcircleoverlay: Texture.EMPTY,
    approachcircle: Texture.EMPTY,
  };

  async load() {
    await Promise.all(
      Object.entries(this.textureUrls).map(async ([key, url]) => {
        this.textures[key as TextureKeys] = await Assets.load(url);
      }),
    );
  }
}
