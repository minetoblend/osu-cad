import type { BackgroundScreen, Beatmap, CarouselBeatmapInfo, CarouselBeatmapSetInfo } from '@osucad/common';
import type { Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import type { BeatmapSetResponse, BeatmapSetResponseBeatmap } from '../../mirrors/BeatmapSetResponse';
import { BeatmapCarousel, EditorBeatmap, OsucadScreen } from '@osucad/common';
import { SizeLimitedContainer } from '@osucad/editor/drawables/SizeLimitedContainer';
import { Anchor, Axes, Bindable, Container, FillDirection, FillFlowContainer, loadTexture, Vec2 } from 'osucad-framework';
import { CatboyMirror } from '../../mirrors/CatboyMirror';
import { LoadingScreen } from '../LoadingScreen';
import { HomeScreenBackground } from './HomeScreenBackground';
import { SearchHero } from './SearchHero';

export class HomeScreen extends OsucadScreen {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(new Container({
      relativeSizeAxes: Axes.Both,
      width: 0.6,
      padding: { top: 100 },
      anchor: Anchor.TopRight,
      origin: Anchor.TopRight,
      child: new BeatmapCarousel(this.beatmaps).adjust((it) => {
        it.scrollOffset = 100;
        it.selectionChanged.addListener(beatmap => this.selectedBeatmap.value = beatmap);
      }),
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
            ],
          }),
        ],
      }),
    );
  }

  selectedBeatmap = new Bindable<CarouselBeatmapInfo | null>(null);

  createBackground(): BackgroundScreen | null {
    return new HomeScreenBackground(this.selectedBeatmap.getBoundCopy());
  }

  readonly beatmaps = new Bindable<CarouselBeatmapSetInfo[]>([]);

  #background!: Drawable;

  #hero!: SearchHero;

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

    const carouselMapsetInfo: CarouselBeatmapSetInfo = {
      id: id.toString(),
      artist,
      title,
      authorName: creator,
      beatmaps: [],
      loadThumbnailLarge: async () => {
        const url = mapset.covers['slimcover@2x']
          .replace('https://assets.ppy.sh/', 'http://localhost:8081/');

        return loadTexture(url);
      },
      loadThumbnailSmall: async () => {
        const url = mapset.covers['cover@2x']
          .replace('https://assets.ppy.sh/', 'http://localhost:8081/');

        return loadTexture(url);
      },
    };

    carouselMapsetInfo.beatmaps = mapset.beatmaps.map<CarouselBeatmapInfo>((beatmap) => {
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
        loadThumbnailLarge: async () => carouselMapsetInfo.loadThumbnailLarge(),
        loadThumbnailSmall: async () => carouselMapsetInfo.loadThumbnailSmall(),
        mapset: carouselMapsetInfo,
        previewPoint: null,
        setId: mapset.id.toString(),
        starRating: difficulty_rating,
        select: async () => {
          this.openEditor(mapset, beatmap);
        },
      };
    });

    return carouselMapsetInfo;
  }

  async openEditor(mapset: BeatmapSetResponse, beatmap: BeatmapSetResponseBeatmap) {
    this.screenStack.push(new LoadingScreen(async () => {
      const workingBeatmapSet = await new CatboyMirror().loadBeatmapSet(mapset.id);
      const difficulty: Beatmap = workingBeatmapSet.beatmaps.find(it => it.metadata.osuWebId === beatmap.id)!;

      return new EditorBeatmap(difficulty, workingBeatmapSet.fileStore, workingBeatmapSet);
    }));
  }
}
