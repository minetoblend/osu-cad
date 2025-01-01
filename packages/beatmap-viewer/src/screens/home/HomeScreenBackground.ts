import type { CarouselBeatmapInfo } from '@osucad/common';
import type { Bindable, Container, ReadonlyDependencyContainer } from 'osucad-framework';
import { BackgroundScreen } from '@osucad/common';
import { Anchor, Axes, Box, DrawableSprite, FillMode, MaskingContainer } from 'osucad-framework';
import { BlurFilter } from 'pixi.js';

export class HomeScreenBackground extends BackgroundScreen {
  constructor(readonly beatmap: Bindable<CarouselBeatmapInfo | null>) {
    super();

    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.addInternal(new Box({
      relativeSizeAxes: Axes.Both,
      color: 0x121216,
    }));

    this.addInternal(this.#content = new MaskingContainer({
      relativeSizeAxes: Axes.Both,
    }));
  }

  #blurFilter = new BlurFilter({
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

  #content!: Container;

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
}
