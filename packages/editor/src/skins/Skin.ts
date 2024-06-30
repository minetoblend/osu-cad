import { Assets, Texture } from 'pixi.js';

export class Skin {
  hitcircle!: Texture;
  hitcircleOverlay!: Texture;
  approachCircle!: Texture;

  comboNumbers: Texture[] = [];

  async load() {
    const comboNumbers = Array.from({ length: 10 }, (_, i) => i).map((i) => ({
      src: `/assets/skin/default-${i}.png`,
      alias: `default-${i}`,
    }));

    Assets.addBundle('skin', [
      { src: '/assets/skin/hitcircle@2x.png', alias: 'hitcircle' },
      {
        src: '/assets/skin/hitcircleoverlay@2x.png',
        alias: 'hitcircleOverlay',
      },
      {
        src: '/assets/skin/approachcircle@2x.png',
        alias: 'approachCircle',
      },
      ...comboNumbers,
    ]);

    await Assets.loadBundle('skin');

    this.hitcircle = Assets.get('hitcircle');
    this.hitcircleOverlay = Assets.get('hitcircleOverlay');
    this.approachCircle = Assets.get('approachCircle');

    for (let i = 0; i < 10; i++) {
      this.comboNumbers.push(Assets.get(`default-${i}`));
    }
  }
}
