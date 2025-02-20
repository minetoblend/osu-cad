import type { BackgroundScreen, CarouselBeatmapInfo, CarouselBeatmapSetInfo, WorkingBeatmapSet } from '@osucad/core';
import type { Drawable, ReadonlyDependencyContainer, ScreenTransitionEvent } from '@osucad/framework';
import type { BeatmapSetResponse, BeatmapSetResponseBeatmap } from '../../mirrors/BeatmapSetResponse';
import { AudioMixer, BeatmapCarousel, OsucadScreen, SizeLimitedContainer } from '@osucad/core';
import { Anchor, AudioManager, Axes, Bindable, Container, FillDirection, FillFlowContainer, loadTexture, resolved, Vec2 } from '@osucad/framework';
import { Router } from '../Router';
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
                .adjust((it) => {
                  it.searchResults.addListener(this.updateResults, this);
                  it.openBeatmap.addListener(({ beatmapSet, id }) => this.openBeatmap(beatmapSet, id));
                }),
            ],
          }),
        ],
      }),
    );
  }

  selectedBeatmap = new Bindable<CarouselBeatmapInfo | null>(null);

  audioEl = document.createElement('audio');

  @resolved(AudioManager)
  audioManager!: AudioManager;

  @resolved(AudioMixer)
  mixer!: AudioMixer;

  #source!: MediaElementAudioSourceNode;

  audioUrl = new Bindable<string | null>(null);

  protected loadComplete() {
    super.loadComplete();

    this.selectedBeatmap.bindValueChanged((beatmap) => {
      this.audioUrl.value = beatmap.value?.audioUrl ?? null;
    }, true);

    this.audioUrl.bindValueChanged((url) => {
      if (url.value) {
        this.audioEl.src = url.value;
      }
      else {
        this.audioEl.src = '';
      }
    }, true);

    this.audioEl.autoplay = true;

    const source = this.#source = this.audioManager.context.createMediaElementSource(this.audioEl);
    source.connect(this.mixer.music.input);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.#source?.disconnect();
  }

  createBackground(): BackgroundScreen | null {
    return new HomeScreenBackground(this.selectedBeatmap.getBoundCopy());
  }

  readonly beatmaps = new Bindable<CarouselBeatmapSetInfo[]>([]);

  #background!: Drawable;

  #hero!: SearchHero;

  updateResults(results: BeatmapSetResponse[]) {
    this.beatmaps.value = results
      .map(mapset => this.createMapsetInfo(mapset))
      .filter(it => it.beatmaps.length > 0);

    this.#hero.minimize();
  }

  protected createMapsetInfo(mapset: BeatmapSetResponse): CarouselBeatmapSetInfo {
    const { artist, title, creator, id, preview_url } = mapset;

    const carouselMapsetInfo: CarouselBeatmapSetInfo = {
      id: id.toString(),
      artist,
      title,
      authorName: creator,
      beatmaps: [],
      loadThumbnailLarge: async () => {
        const url = mapset.covers['card@2x']
          .replace('https://assets.ppy.sh/', '/');

        return loadTexture(url);
      },
      loadThumbnailSmall: async () => {
        const url = mapset.covers.slimcover
          .replace('https://assets.ppy.sh/', '/');

        return loadTexture(url);
      },
    };

    carouselMapsetInfo.beatmaps = mapset.beatmaps
      .filter(it => it.mode_int === 0)
      .map<CarouselBeatmapInfo>((beatmap) => {
        const { id, version, difficulty_rating } = beatmap;

        return {
          id: id.toString(),
          artist,
          title,
          audioUrl: `/preview/${mapset.id}.mp3`,
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
          select: async () => this.openEditor(mapset, beatmap),
        };
      });

    return carouselMapsetInfo;
  }

  @resolved(() => Router)
  router!: Router;

  async openEditor(mapset: BeatmapSetResponse, beatmap: BeatmapSetResponseBeatmap) {
    this.router.presentBeatmap({
      beatmapSet: mapset.id,
      beatmap: beatmap.id,
    });
  }

  async openBeatmap(workingBeatmapSet: WorkingBeatmapSet, id: number) {
    this.router.presentBeatmap({
      beatmapSet: workingBeatmapSet,
      beatmap: id,
    });
  }

  onSuspending(e: ScreenTransitionEvent) {
    super.onSuspending(e);

    this.audioEl.pause();

    this.applyToBackground(it => (it as HomeScreenBackground).enableLetterbox());
  }

  onResuming(e: ScreenTransitionEvent) {
    super.onResuming(e);

    this.audioEl.play();

    this.applyToBackground(it => (it as HomeScreenBackground).disableLetterbox());
  }
}
