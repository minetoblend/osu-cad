import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { BeatmapCarousel, type CarouselBeatmapSetInfo, OsucadScreen } from '@osucad/core';
import { Anchor, Axes, Bindable, Container, FillDirection, FillFlowContainer } from '@osucad/framework';

export class HomeScreen extends OsucadScreen {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(new FillFlowContainer({
      direction: FillDirection.Vertical,
      relativeSizeAxes: Axes.Both,
      width: 0.35,
      padding: { vertical: 40, horizontal: 20 },
      children: [

      ],
    }));
  }

  readonly beatmaps = new Bindable<CarouselBeatmapSetInfo[]>([]);

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await super.loadAsync(dependencies);

    this.beatmaps.value = await this.loadBeatmaps();

    this.addInternal(new Container({
      relativeSizeAxes: Axes.Both,
      width: 0.65,
      anchor: Anchor.TopRight,
      origin: Anchor.TopRight,
      child: this.carousel = new BeatmapCarousel(this.beatmaps),
    }));
  }

  protected async loadBeatmaps(): Promise<CarouselBeatmapSetInfo[]> {
    return [];
  }

  carousel!: BeatmapCarousel;
}
