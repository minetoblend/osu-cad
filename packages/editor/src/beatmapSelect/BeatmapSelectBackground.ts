import type { Bindable, DependencyContainer, GameHost, ScreenTransitionEvent, ValueChangedEvent } from 'osucad-framework';
import type { BeatmapItemInfo } from './BeatmapItemInfo';
import { OsucadConfigManager, OsucadSettings } from '@osucad/common';
import { Anchor, Axes, BindableBoolean, Box, Container, dependencyLoader, DrawableSprite, EasingFunction, FillMode, GAME_HOST, loadTexture, resolved } from 'osucad-framework';
import { BlurFilter } from 'pixi.js';
import { BackgroundScreen } from '../BackgroundScreen';
import { EditorBackground } from '../editor/EditorBackground';
import { GlobalBeatmapBindable } from '../GlobalBeatmapBindable';

export class BeatmapSelectBackground extends BackgroundScreen {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.addInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x0B0B0D,
        size: 2,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );

    this.addInternal(this.#content = new Container({
      relativeSizeAxes: Axes.Both,
      scale: 1.2,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      alpha: 0.5,
      filters: [
        this.blurFilter = new BlurFilter({
          strength: 10,
          quality: 3,
          antialias: 'off',
          resolution: 0.5,
        }),
      ],
    }));
  }

  beatmap!: Bindable<BeatmapItemInfo | null>;

  blurFilter: BlurFilter;

  #content: Container;

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
  load(dependencies: DependencyContainer) {
    this.beatmap = dependencies.resolve(GlobalBeatmapBindable).getBoundCopy();

    this.config.bindWith(OsucadSettings.SongSelectBackgroundBlur, this.backgroundBlur);

    this.backgroundBlur.addOnChangeListener(
      e => this.transformTo('blurStrength', e.value ? 10 : 0, 350, EasingFunction.OutExpo),
      { immediate: true },
    );

    this.beatmap.addOnChangeListener(e => this.#updateTexture(e), { immediate: true });
  }

  #currentSprite: DrawableSprite | null = null;

  async #updateTexture(e: ValueChangedEvent<BeatmapItemInfo | null>) {
    const beatmap = e.value;

    const backgroundPath = await beatmap?.backgroundPath();

    if (this.#currentBackgroundPath === backgroundPath)
      return;

    if (this.#currentSprite) {
      this.#currentSprite.fadeOut(300);
      this.#currentSprite.expire();
      this.#currentSprite = null;
    }

    if (!backgroundPath) {
      this.#currentBackgroundPath = null;
      return;
    }

    const texture = await loadTexture(backgroundPath);

    this.#currentBackgroundPath = backgroundPath;

    if (texture) {
      if (this.isDisposed || beatmap !== this.beatmap.value) {
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

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.fadeInFromZero(500);
  }

  onSuspending(e: ScreenTransitionEvent) {
    super.onSuspending(e);

    this.fadeOut(500);
  }

  onResuming(e: ScreenTransitionEvent) {
    super.onResuming(e);

    this.fadeInFromZero(500);

    if (e.source instanceof EditorBackground) {
      this.scaleTo(e.source.scale.x / 1.2)
        .scaleTo(1, 500, EasingFunction.OutExpo);
    }
  }
}
