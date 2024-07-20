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
  loadTexture,
  resolved,
} from 'osucad-framework';

import { BlurFilter, RenderTexture } from 'pixi.js';
import type { BeatmapInfo } from '../beatmaps/BeatmapInfo';

export class BeatmapSelectBackground extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.alpha = 0.2;

    this.drawNode.filters = [
      new BlurFilter({
        strength: 10,
        quality: 3,
        antialias: 'off',
        resolution: 1,
      }),
    ];
  }

  #currentBeatmap: BeatmapInfo | null = null;

  get currentBeatmap(): BeatmapInfo | null {
    return this.#currentBeatmap;
  }

  set currentBeatmap(value: BeatmapInfo | null) {
    if (this.#currentBeatmap === value)
      return;

    this.#currentBeatmap = value;

    this.#updateTexture();
  }

  #currentSprite: DrawableSprite | null = null;

  async #updateTexture() {
    const beatmap = this.#currentBeatmap;
    if (this.#currentBeatmap?.thumbnailLarge) {
      const texture = await loadTexture(this.#currentBeatmap.thumbnailLarge);
      if (!texture)
        return;

      if (this.isDisposed || beatmap !== this.#currentBeatmap) {
        texture.destroy();
        return;
      }

      if (this.#currentSprite) {
        this.#currentSprite.fadeOut({
          duration: 300,

        });
        this.#currentSprite.expire();
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
    else if (this.#currentSprite) {
      this.#currentSprite.fadeOut({
        duration: 300,

      });
      this.#currentSprite.expire();

      this.#currentSprite = null;
    }
  }

  @resolved(GAME_HOST)
  gameHost!: GameHost;
}
