import type {
  GameHost,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  CompositeDrawable,
  DrawableSprite,
  FillMode,
  GAME_HOST,
  resolved,
} from 'osucad-framework';

import { BlurFilter, RenderTexture } from 'pixi.js';
import type { BeatmapItemInfo } from './BeatmapItemInfo';

export class BeatmapSelectBackground extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.alpha = 0.3;

    this.drawNode.filters = [
      new BlurFilter({
        strength: 10,
        quality: 3,
        antialias: 'off',
        resolution: 1,
      }),
    ];
  }

  #currentBeatmap: BeatmapItemInfo | null = null;

  get currentBeatmap(): BeatmapItemInfo | null {
    return this.#currentBeatmap;
  }

  set currentBeatmap(value: BeatmapItemInfo | null) {
    if (this.#currentBeatmap === value)
      return;

    this.#currentBeatmap = value;

    this.#updateTexture();
  }

  #currentSprite: DrawableSprite | null = null;

  async #updateTexture() {
    const beatmap = this.#currentBeatmap;

    const texture = await this.#currentBeatmap?.loadThumbnailLarge();

    if (this.#currentSprite?.texture === texture)
      return;

    if (this.#currentSprite) {
      this.#currentSprite.fadeOut({
        duration: 300,
      });
      this.#currentSprite.expire();
    }

    if (texture) {
      if (this.isDisposed || beatmap !== this.#currentBeatmap) {
        texture.destroy();
        return;
      }

      const renderTexture = RenderTexture.create({
        width: texture.width * 4,
        height: texture.height * 4,
      });

      const renderer = this.gameHost.renderer.internalRenderer;

      // const blurred = new PIXISprite({
      //   texture,
      //   scale: 4,
      // });
      //
      // blurred.filters = [
      //   new BlurFilter({
      //     quality: 4,
      //     strength: 5,
      //   }),
      // ];
      //
      // renderer.render({
      //   container: blurred,
      //   target: renderTexture,
      // });
      //
      // texture.destroy();
      // blurred.destroy();

      const sprite = new DrawableSprite({
        texture,
        relativeSizeAxes: Axes.Both,
        scale: 1.2,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      });

      sprite.fillMode = FillMode.Fill;
      sprite.fillAspectRatio = texture.width / texture.height;

      this.addInternal(this.#currentSprite = sprite);

      sprite.onDispose(() => renderTexture.destroy());

      sprite.fadeIn({
        duration: 300,
      });
    }
  }

  @resolved(GAME_HOST)
  gameHost!: GameHost;
}
