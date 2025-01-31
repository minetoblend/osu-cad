import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { APIProvider, BeatmapCarousel, type CarouselBeatmapSetInfo, GetBeatmapSetsRequest, MultiplayerEditor, MultiplayerEditorBeatmap, OsucadMultiplayerClient, OsucadScreen } from '@osucad/core';
import { Anchor, Axes, Bindable, Container, FillDirection, FillFlowContainer, loadTexture, resolved } from '@osucad/framework';

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

  @resolved(APIProvider)
  protected api!: APIProvider;

  protected async loadBeatmaps(): Promise<CarouselBeatmapSetInfo[]> {
    try {
      const response = await this.api.execute(new GetBeatmapSetsRequest());

      return response.map((it) => {
        const beatmapWithBackground = it.beatmaps.find(it => it.backgroundUrl !== null);

        return {
          id: it.id,
          artist: it.artist,
          title: it.title,
          authorName: it.beatmaps[0].creator,
          loadThumbnailLarge: async () => beatmapWithBackground ? await loadTexture(beatmapWithBackground.backgroundUrl!) : null,
          loadThumbnailSmall: async () => beatmapWithBackground ? await loadTexture(beatmapWithBackground.backgroundUrl!) : null,
          beatmaps: it.beatmaps.map((beatmap) => {
            return {
              id: beatmap.id,
              setId: it.id,
              starRating: 0,
              artist: beatmap.artist,
              title: beatmap.title,
              authorName: beatmap,
              previewPoint: null,
              mapset: null,
              difficultyName: beatmap.difficultyName,
              loadThumbnailLarge: async () => beatmap.backgroundUrl ? await loadTexture(beatmap.backgroundUrl) : null,
              loadThumbnailSmall: async () => beatmap.backgroundUrl ? await loadTexture(beatmap.backgroundUrl) : null,
              lastEdited: null,
              backgroundPath: async () => beatmap.backgroundUrl,
              audioUrl: beatmap.audioUrl,
              select: () => {
                this.loadEditor(beatmap.id);
              },
            };
          }),
        };
      });
    }
    catch (e) {
      console.error(e);
      return [];
    }
  }

  carousel!: BeatmapCarousel;

  async loadEditor(id: string) {
    const { accessToken } = await fetch(`http://localhost:3001/api/v1/rooms/${id}/token`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(res => res.json());

    const client = new OsucadMultiplayerClient(
      'http://localhost:3002',
      accessToken,
    );

    await client.connect();

    this.screenStack.push(new MultiplayerEditor(new MultiplayerEditorBeatmap(client)));
  }
}
