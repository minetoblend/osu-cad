import { Assets, Texture } from 'pixi.js';

export type TextureKeys =
  | 'hitcircle'
  | 'hitcircleoverlay'
  | 'approachcircle'
  | 'default0'
  | 'default1'
  | 'default2'
  | 'default3'
  | 'default4'
  | 'default5'
  | 'default6'
  | 'default7'
  | 'default8'
  | 'default9';

export class Skin {
  textureUrls: {
    [key in TextureKeys]: string;
  } = {
    hitcircle: '/assets/skin/hitcircle@2x.png',
    hitcircleoverlay: '/assets/skin/hitcircleoverlay@2x.png',
    approachcircle: '/assets/skin/approachcircle@2x.png',
    default0: '/assets/skin/default-0@2x.png',
    default1: '/assets/skin/default-1@2x.png',
    default2: '/assets/skin/default-2@2x.png',
    default3: '/assets/skin/default-3@2x.png',
    default4: '/assets/skin/default-4@2x.png',
    default5: '/assets/skin/default-5@2x.png',
    default6: '/assets/skin/default-6@2x.png',
    default7: '/assets/skin/default-7@2x.png',
    default8: '/assets/skin/default-8@2x.png',
    default9: '/assets/skin/default-9@2x.png',
  };

  textures: {
    [key in TextureKeys]: Texture;
  } = {
    hitcircle: Texture.EMPTY,
    hitcircleoverlay: Texture.EMPTY,
    approachcircle: Texture.EMPTY,
    default0: Texture.EMPTY,
    default1: Texture.EMPTY,
    default2: Texture.EMPTY,
    default3: Texture.EMPTY,
    default4: Texture.EMPTY,
    default5: Texture.EMPTY,
    default6: Texture.EMPTY,
    default7: Texture.EMPTY,
    default8: Texture.EMPTY,
    default9: Texture.EMPTY,
  };

  async load() {
    await Promise.all(
      Object.entries(this.textureUrls).map(async ([key, url]) => {
        this.textures[key as TextureKeys] = await Assets.load(url);
      }),
    );
  }
}
