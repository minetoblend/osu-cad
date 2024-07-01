import { Assets, Texture } from 'pixi.js';

export class Skin {
  hitcircle!: Texture;
  hitcircleOverlay!: Texture;
  approachCircle!: Texture;
  sliderFollowCircle!: Texture;

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
      {
        src: '/assets/skin/sliderfollowcircle.png',
        alias: 'sliderfollowcircle',
      },
      ...comboNumbers,
    ]);

    await Assets.loadBundle('skin');

    this.hitcircle = Assets.get('hitcircle');
    this.hitcircleOverlay = Assets.get('hitcircleOverlay');
    this.approachCircle = Assets.get('approachCircle');
    this.sliderFollowCircle = Assets.get('sliderfollowcircle');

    for (let i = 0; i < 10; i++) {
      this.comboNumbers.push(Assets.get(`default-${i}`));
    }
  }
}
