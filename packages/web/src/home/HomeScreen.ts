import type { APIBeatmapSet, CarouselBeatmapSetInfo } from '@osucad/core';
import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { APIProvider, BeatmapCarousel, GetBeatmapSetsRequest, OsucadScreen } from '@osucad/core';
import { Anchor, Axes, Bindable, Container, FillDirection, FillFlowContainer, resolved } from '@osucad/framework';
import { EditorLoader } from '../edit/EditorLoader';
import { APICarouselBeatmapSetInfo } from './APICarouselBeatmapSetInfo';
import { ImportCard } from './ImportCard';

export class HomeScreen extends OsucadScreen {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(new FillFlowContainer({
      direction: FillDirection.Vertical,
      relativeSizeAxes: Axes.Both,
      width: 0.35,
      padding: { vertical: 40, horizontal: 20 },
      children: [
        new ImportCard(beatmapSet => this.onBeatmapSetImported(beatmapSet)),
      ],
    }));
  }

  readonly beatmaps = new Bindable<CarouselBeatmapSetInfo[]>([]);

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await super.loadAsync(dependencies);

    this.beatmaps.value = await this.loadBeatmaps();

    this.addInternal(new Container({
      relativeSizeAxes: Axes.Both,
      width: 0.5,
      anchor: Anchor.TopRight,
      origin: Anchor.TopRight,
      child: this.carousel = new BeatmapCarousel(this.beatmaps),
    }));
  }

  @resolved(APIProvider)
  protected api!: APIProvider;

  protected async loadBeatmaps(): Promise<CarouselBeatmapSetInfo[]> {
    try {
      const response = await this.api.execute(new GetBeatmapSetsRequest());

      const beatmapSets = response.map(it => new APICarouselBeatmapSetInfo(it));

      for (const set of beatmapSets) {
        for (const beatmap of set.beatmaps)
          beatmap.selected.addListener(it => this.loadEditor(it.id));
      }

      return beatmapSets;
    }
    catch (e) {
      console.error(e);
      return [];
    }
  }

  carousel!: BeatmapCarousel;

  async loadEditor(id: string) {
    this.screenStack.push(new EditorLoader(id));
  }

  protected onBeatmapSetImported(beatmapSet: APIBeatmapSet) {
    const set = new APICarouselBeatmapSetInfo(beatmapSet);
    for (const beatmap of set.beatmaps)
      beatmap.selected.addListener(it => this.loadEditor(it.id));

    this.beatmaps.value = [set, ...this.beatmaps.value];
  }
}
