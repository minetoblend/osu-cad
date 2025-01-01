import type { CarouselBeatmapInfo } from '@osucad/common';
import type { Bindable, ReadonlyDependencyContainer } from 'osucad-framework';
import { BackgroundScreen } from '@osucad/common';
import { Anchor, Axes, Box, DrawableSprite, FillMode } from 'osucad-framework';

export class HomeScreenBackground extends BackgroundScreen {
  constructor(readonly beatmap: Bindable<CarouselBeatmapInfo | null>) {
    super();

    this.addInternal(new Box({
      relativeSizeAxes: Axes.Both,
      color: 0x121216,
    }));
  }

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
    console.log(beatmap);
    if (!beatmap) {
      this.#currentBackground?.fadeOut(100).expire();
      return;
    }

    const texture = await beatmap.loadThumbnailLarge();
    if (beatmap !== this.beatmap.value)
      return;

    this.#currentBackground?.fadeOut(100).expire();

    this.addInternal(this.#currentBackground = new DrawableSprite({
      texture,
      relativeSizeAxes: Axes.Both,
      fillMode: FillMode.Fill,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      alpha: 0.5,
    }));

    this.#currentBackground.fadeOut().fadeTo(0.2, 100);
  }
}
