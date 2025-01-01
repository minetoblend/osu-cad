import type { Beatmap, CarouselBeatmapInfo, CarouselBeatmapSetInfo } from '@osucad/common';
import type { Drawable, ReadonlyDependencyContainer, ScreenTransitionEvent } from 'osucad-framework';
import type { BeatmapSetResponse, BeatmapSetResponseBeatmap } from '../../mirrors/BeatmapSetResponse';
import { BeatmapCarousel, EditorBeatmap, OsucadScreen } from '@osucad/common';
import { SizeLimitedContainer } from '@osucad/editor/drawables/SizeLimitedContainer';
import { Anchor, Axes, Bindable, Box, Container, FillDirection, FillFlowContainer, loadTexture, Vec2 } from 'osucad-framework';
import { CatboyMirror } from '../../mirrors/CatboyMirror';
import { LoadingScreen } from '../LoadingScreen';
import { SearchHero } from './SearchHero';

export class HomeScreen extends OsucadScreen {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.#background = new Box({
      relativeSizeAxes: Axes.Both,
      color: 0x121216,
    }));

    this.addInternal(new Container({
      relativeSizeAxes: Axes.Both,
      width: 0.6,
      padding: { top: 100 },
      anchor: Anchor.TopRight,
      origin: Anchor.TopRight,
      child: new BeatmapCarousel(this.beatmaps),
    }));

    this.addInternal(
      new SizeLimitedContainer({
        maxWidth: 800,
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        anchor: Anchor.TopCenter,
        origin: Anchor.TopCenter,
        padding: { horizontal: 20, vertical: 10 },
        children: [
          new FillFlowContainer({
            relativeSizeAxes: Axes.X,
            autoSizeAxes: Axes.Y,
            direction: FillDirection.Vertical,
            spacing: new Vec2(50),
            children: [
              this.#hero = new SearchHero()
                .adjust(it => it.search.addListener(this.search, this)),
              // this.#resultContainer = new FillFlowContainer({
              //   autoSizeAxes: Axes.Both,
              //   maximumSize: new Vec2(800, Number.MAX_VALUE),
              //   spacing: new Vec2(10),
              //   anchor: Anchor.TopCenter,
              //   origin: Anchor.TopCenter,
              // }),
            ],
          }),
        ],
      }),
    );
  }

  readonly beatmaps = new Bindable<CarouselBeatmapSetInfo[]>([]);

  override onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.#background
      .fadeOut()
      .delay(500)
      .fadeIn(500);
  }

  #background!: Drawable;

  #hero!: SearchHero;

  #resultContainer!: Container;

  async search(term: string) {
    term = term.trim();

    if (!term.length)
      return;

    const results = await new CatboyMirror().search(term);

    this.beatmaps.value = results.map(mapset => this.createMapsetInfo(mapset));

    this.#hero.minimize();
  }

  protected createMapsetInfo(mapset: BeatmapSetResponse): CarouselBeatmapSetInfo {
    const { artist, title, creator, id, beatmaps } = mapset;

    return {
      id: id.toString(),
      artist,
      title,
      authorName: creator,
      beatmaps:
        mapset.beatmaps.map<CarouselBeatmapInfo>((beatmap) => {
          const { id, version, difficulty_rating } = beatmap;

          return {
            id: id.toString(),
            artist,
            title,
            audioUrl: '',
            authorName: creator,
            difficultyName: version,
            backgroundPath: async () => null,
            lastEdited: null,
            loadThumbnailLarge: async () => null,
            loadThumbnailSmall: async () => null,
            mapset: null,
            previewPoint: null,
            setId: mapset.id.toString(),
            starRating: difficulty_rating,
            select: async () => {
              this.openEditor(mapset, beatmap);
            },
          };
        }),
      loadThumbnailLarge: async () => {
        const url = mapset.covers['slimcover@2x']
          .replace('https://assets.ppy.sh/', 'http://localhost:8081/');

        console.log(url);

        return loadTexture(url);
      },
      loadThumbnailSmall: async () => {
        return null;
      },
    };
  }

  async openEditor(mapset: BeatmapSetResponse, beatmap: BeatmapSetResponseBeatmap) {
    this.screenStack.push(new LoadingScreen(async () => {
      const workingBeatmapSet = await new CatboyMirror().loadBeatmapSet(mapset.id);
      const difficulty: Beatmap = workingBeatmapSet.beatmaps.find(it => it.metadata.osuWebId === beatmap.id)!;

      return new EditorBeatmap(difficulty, workingBeatmapSet.fileStore, workingBeatmapSet);
    }));
  }
}
