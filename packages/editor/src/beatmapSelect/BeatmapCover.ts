import { Anchor, Axes, Bindable, Box, CompositeDrawable, DrawableSprite, FillMode, Vec2 } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import { Assets, Graphics, GraphicsContext } from 'pixi.js';
import type { BeatmapInfo } from '@osucad/common';
import { CAROUSEL_ITEM_HEIGHT } from './constants';

const mask = new GraphicsContext()
  .roundRect(0, 0, CAROUSEL_ITEM_HEIGHT, CAROUSEL_ITEM_HEIGHT, 4)
  .fill();

export class BeatmapCover extends CompositeDrawable {
  constructor(readonly beatmap: BeatmapInfo) {
    super();

    this.size = new Vec2(CAROUSEL_ITEM_HEIGHT);

    this.drawNode.mask = this.drawNode.addChild(new Graphics(mask));

    this.addInternal(new Box({
      relativeSizeAxes: Axes.Both,
      color: 0x373744,
    }));

    if (beatmap.links.thumbnail) {
      Assets.load({
        src: beatmap.links.thumbnail,
        loadParser: 'loadTextures',
      }).then((texture) => {
        this.loading.value = false;
        if (texture) {
          this.textureLoaded(texture);
        }
      });
    }
    else {
      this.loading.value = false;
    }
  }

  background?: DrawableSprite;

  loading = new Bindable(true);

  textureLoaded(texture: Texture) {
    const sprite = this.background = new DrawableSprite({
      texture,
      relativeSizeAxes: Axes.Both,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    });

    sprite.fillMode = FillMode.Fill;
    sprite.fillAspectRatio = texture.width / texture.height;

    this.addInternal(sprite);
  }
}
