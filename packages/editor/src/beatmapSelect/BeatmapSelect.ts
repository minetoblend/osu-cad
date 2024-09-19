import type { ScreenTransitionEvent } from 'osucad-framework';
import type { BeatmapStore } from '../environment/BeatmapStore';
import { Anchor, Axes, Box, Container, dependencyLoader, EasingFunction, resolved } from 'osucad-framework';
import { EditorEnvironment } from '../environment/EditorEnvironment';
import { GlobalSongPlayback } from '../GlobalSongPlayback';
import { OsucadScreen } from '../OsucadScreen';
import { BeatmapCarousel } from './BeatmapCarousel';
import { BeatmapImportDropzone } from './BeatmapImportDropzone';
import { BeatmapSelectBackground } from './BeatmapSelectBackground';
import { BeatmapSelectFilter } from './BeatmapSelectFilter';
import { BeatmapSelectHeader } from './BeatmapSelectHeader';

export class BeatmapSelect extends OsucadScreen {
  getPath(): string {
    return '/';
  }

  constructor() {
    super();

    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
  }

  @resolved(EditorEnvironment)
  environment!: EditorEnvironment;

  beatmapStore!: BeatmapStore;

  filter!: BeatmapSelectFilter;

  @dependencyLoader()
  load() {
    this.beatmapStore = this.environment.beatmaps;

    this.addInternal(
      this.filter = new BeatmapSelectFilter(this.beatmapStore.beatmaps),
    );

    this.addInternal(new Box({
      relativeSizeAxes: Axes.Both,
      color: 0x0B0B0D,
      size: 2,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));

    let dropzone: BeatmapImportDropzone;

    this.addAllInternal(
      dropzone = new BeatmapImportDropzone({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [
          this.#background = new BeatmapSelectBackground(),
          this.#carousel = new BeatmapCarousel(this.beatmapStore.beatmaps)
            .with({
              width: 0.6,
              anchor: Anchor.CenterRight,
              origin: Anchor.CenterRight,
            }),
          this.#menu = new Container({
            relativeSizeAxes: Axes.Both,
            anchor: Anchor.BottomLeft,
            origin: Anchor.BottomLeft,
            width: 0.4,
            height: 0.8,
            padding: 50,
            children: [
              // new CreateBeatmapCard(),
            ],
          }),
          this.#header = new BeatmapSelectHeader(this.filter),
        ],
      }),
    );

    this.#carousel.bleedTop = 300;
    this.#carousel.bleedBottom = 300;

    this.#carousel.selectionChanged.addListener((beatmap) => {
      this.#background.currentBeatmap = beatmap;
      this.globalSongPlayback.playAudio(beatmap.audioUrl, beatmap.previewPoint ?? 10000);
    });

    dropzone.uploadFinished.addListener((mapset) => {
      this.#carousel.addMapset(mapset);
    });

    this.filter.visibleBeatmaps.addOnChangeListener((ids) => {
      this.#carousel.applyFilter(ids.value);
    });
  }

  #menu!: Container;

  #header!: BeatmapSelectHeader;

  @resolved(GlobalSongPlayback)
  globalSongPlayback!: GlobalSongPlayback;

  #background!: BeatmapSelectBackground;

  #carousel!: BeatmapCarousel;

  #isActive = true;

  onSuspending(e: ScreenTransitionEvent) {
    this.#isActive = false;

    this.#carousel.fadeOut(400, EasingFunction.OutExpo);
    this.#carousel.scaleTo(1.3, 600, EasingFunction.OutExpo);
    this.#carousel.moveToX(500, 600, EasingFunction.OutExpo);

    this.#menu.moveToX(-500, 600, EasingFunction.OutExpo);
    this.#menu.fadeOut(400, EasingFunction.OutExpo);

    this.#background.fadeTo(0, 600);

    this.#header.hide();

    this.#background.scaleTo(0.85, 1000, EasingFunction.OutExpo);

    // noop transform to delay when the container gets suspended
    this.fadeIn(600);

    super.onSuspending(e);
  }

  onResuming(e: ScreenTransitionEvent) {
    this.#isActive = true;

    this.#carousel.moveToX(0, 400, EasingFunction.OutQuart);
    this.#carousel.scaleTo(1, 400, EasingFunction.OutQuart);
    this.#carousel.entryAnimation();
    this.#carousel.alpha = 1;

    this.#menu.moveToX(0, 400, EasingFunction.OutQuart);
    this.#menu.fadeIn(400);

    this.#header.show();

    this.#background.fadeTo(0.3, 300);
    this.globalSongPlayback.resume();

    this.#background.scaleTo(1, 500, EasingFunction.OutExpo);

    this.fadeInFromZero(400);

    super.onResuming(e);
  }

  get propagatePositionalInputSubTree(): boolean {
    return this.#isActive && super.propagatePositionalInputSubTree;
  }

  get propagateNonPositionalInputSubTree(): boolean {
    return this.#isActive && super.propagateNonPositionalInputSubTree;
  }
}
