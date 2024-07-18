import {
  Anchor,
  Axes,
  Bindable,
  CompositeDrawable,
  FillMode,
  RoundedBox,
  Vec2,
  loadTexture,
} from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { BeatmapInfo } from '@osucad/common';
import { CAROUSEL_ITEM_HEIGHT } from './constants';

export class BeatmapCover extends CompositeDrawable {
  constructor(readonly beatmap: BeatmapInfo) {
    super();

    this.size = new Vec2(CAROUSEL_ITEM_HEIGHT);

    this.addInternal(new RoundedBox({
      relativeSizeAxes: Axes.Both,
      color: 0x373744,
      cornerRadius: 4,
    }));

    if (beatmap.links.thumbnail) {
      loadTexture(beatmap.links.thumbnail)
        .then((texture) => {
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

  background?: RoundedBox;

  loading = new Bindable(true);

  textureLoaded(texture: Texture) {
    this.addInternal(this.background = new RoundedBox({
      texture,
      cornerRadius: 4,
      relativeSizeAxes: Axes.Both,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      textureFillMode: FillMode.Fill,
    }));
  }

  dispose(): boolean {
    this.background?.texture?.destroy();

    return super.dispose();
  }
}
