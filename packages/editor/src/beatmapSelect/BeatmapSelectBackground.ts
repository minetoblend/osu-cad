import {
  Anchor,
  Axes,
  CompositeDrawable, Container,
  DrawableSprite,
  FillMode,
  GAME_HOST,
  GameHost,
  loadTexture,
  resolved,
} from 'osucad-framework';
import type { BeatmapItemInfo } from './BeatmapItemInfo';
import { BlurFilter } from 'pixi.js';

export class BeatmapSelectBackground extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.alpha = 0.3;

    this.#content.drawNode.filters = [
      this.blurFilter = new BlurFilter({
        strength: 10,
        quality: 3,
        antialias: 'off',
        resolution: 0.5,
      }),
    ];

    this.addInternal(this.#content);
  }

  blurFilter: BlurFilter;

  #content: Container = new Container({
    relativeSizeAxes: Axes.Both,
    scale: 1.2,
    anchor: Anchor.Center,
    origin: Anchor.Center,
  });

  #currentBeatmap: BeatmapItemInfo | null = null;

  #currentBackgroundPath: string | null = null;

  backgroundBlur = new BindableBoolean();

  get blurStrength() {
    return this.blurFilter.strength;
  }

  set blurStrength(value) {
    this.blurFilter.strength = value;

    if (value <= 0 && this.#content.filters.length > 0)
      this.#content.filters = [];
    else if (value > 0 && this.#content.filters.length === 0)
      this.#content.filters = [this.blurFilter];
  }

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  @dependencyLoader()
  load() {
    this.config.bindWith(OsucadSettings.SongSelectBackgroundBlur, this.backgroundBlur);

    this.backgroundBlur.addOnChangeListener(
      e => this.transformTo('blurStrength', e.value ? 10 : 0, 350, EasingFunction.OutExpo),
      { immediate: true },
    );
  }

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

    const backgroundPath = await beatmap?.backgroundPath();

    if (this.#currentBackgroundPath === backgroundPath)
      return;

    if (this.#currentSprite) {
      this.#currentSprite.fadeOut(300);
      this.#currentSprite.expire();
    }

    if (!backgroundPath) {
      this.#currentBackgroundPath = null;
      return;
    }

    const texture = await loadTexture(backgroundPath);

    this.#currentBackgroundPath = backgroundPath;

    if (texture) {
      if (this.isDisposed || beatmap !== this.#currentBeatmap) {
        texture.destroy(true);
        return;
      }

      const sprite = new DrawableSprite({
        texture,
        relativeSizeAxes: Axes.Both,
        fillMode: FillMode.Fill,

        anchor: Anchor.Center,
        origin: Anchor.Center,
      });

      this.#content.add(sprite);

      sprite.onDispose(() => texture.destroy(true));

      sprite.fadeInFromZero(300);

      this.#currentSprite = sprite;
    }
  }

  @resolved(GAME_HOST)
  gameHost!: GameHost;
}
