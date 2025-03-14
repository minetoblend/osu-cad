import type { CarouselBeatmapInfo } from '@osucad/core';
import type {
  Bindable,
  ReadonlyDependencyContainer,
} from '@osucad/framework';
import { BackgroundScreen } from '@osucad/core';
import {
  Anchor,
  Axes,
  BetterBlurFilter,
  Box,
  Container,
  DrawableSprite,
  EasingFunction,
  FillMode,
  MaskingContainer,
} from '@osucad/framework';

export class HomeScreenBackground extends BackgroundScreen {
  constructor(readonly beatmap: Bindable<CarouselBeatmapInfo | null>) {
    super();

    this.addInternal(this.background = new Box({
      relativeSizeAxes: Axes.Both,
      color: 0x121216,
    }));

    this.addInternal(this.#letterboxContainer = new MaskingContainer({
      relativeSizeAxes: Axes.Both,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      child: this.#content = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    }));
  }

  readonly background: Box;

  #blurFilter = new BetterBlurFilter({
    strength: 15,
    quality: 3,
    antialias: 'inherit',
    resolution: devicePixelRatio,
  });

  get blurStrength() {
    return this.#blurFilter.strength;
  }

  set blurStrength(value) {
    this.#blurFilter.strength = value;
  }

  readonly #content!: Container;

  readonly #letterboxContainer!: Container;

  protected load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.beatmap.addOnChangeListener((beatmap) => {
      if (beatmap.value?.mapset === beatmap.previousValue?.mapset)
        return;

      this.loadBackground(beatmap.value);
    }, { immediate: true });
  }

  #currentBackground?: DrawableSprite;

  async loadBackground(beatmap: CarouselBeatmapInfo | null) {
    if (!beatmap) {
      this.#currentBackground?.fadeOut(100).expire();
      return;
    }

    const texture = await beatmap.loadThumbnailLarge();
    if (beatmap !== this.beatmap.value)
      return;

    this.#currentBackground?.fadeOut(100).expire();

    this.#content.add(this.#currentBackground = new DrawableSprite({
      texture,
      relativeSizeAxes: Axes.Both,
      fillMode: FillMode.Fill,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      alpha: 0.5,
      filters: [this.#blurFilter],
    }));

    this.#currentBackground.onDispose(() => texture?.destroy(true));

    this.#currentBackground.fadeOut().fadeTo(0.2, 100);
  }

  enableLetterbox() {
    this.transformTo('blurStrength', 0, 300);

    this
      .#letterboxContainer
      .fadeTo(0.75, 500)
      .resizeHeightTo(0.4, 700, EasingFunction.OutExpo);

    this
      .background
      .fadeColor(0x000000, 200);
  }

  disableLetterbox() {
    this.transformTo('blurStrength', 15);

    this
      .#letterboxContainer
      .resizeHeightTo(1)
      .fadeInFromZero(300);

    this
      .background
      .fadeColor(0x121216);
  }
}
