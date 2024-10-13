import type { Bindable, DependencyContainer, ScreenTransitionEvent } from 'osucad-framework';
import type { BackgroundScreen } from '../BackgroundScreen';
import type { BeatmapStore } from '../environment/BeatmapStore';
import type { BeatmapItemInfo } from './BeatmapItemInfo';
import { Anchor, Axes, Container, dependencyLoader, EasingFunction, resolved } from 'osucad-framework';
import { EditorEnvironment } from '../environment/EditorEnvironment';
import { GlobalBeatmapBindable } from '../GlobalBeatmapBindable';
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

  createBackground(): BackgroundScreen | null {
    return new BeatmapSelectBackground();
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

  beatmap!: Bindable<BeatmapItemInfo | null>;

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    this.beatmapStore = this.environment.beatmaps;

    this.addInternal(
      this.filter = new BeatmapSelectFilter(this.beatmapStore.beatmaps),
    );

    let dropzone: BeatmapImportDropzone;

    this.addAllInternal(
      dropzone = new BeatmapImportDropzone({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [
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

    this.beatmap = dependencies.resolve(GlobalBeatmapBindable).getBoundCopy();

    this.#carousel.selectionChanged.addListener((beatmap) => {
      this.beatmap.value = beatmap;
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

  #carousel!: BeatmapCarousel;

  #isActive = true;

  onSuspending(e: ScreenTransitionEvent) {
    this.#isActive = false;

    this.#carousel.fadeOut(400, EasingFunction.OutExpo);
    this.#carousel.scaleTo(1.3, 600, EasingFunction.OutExpo);
    this.#carousel.moveToX(500, 600, EasingFunction.OutExpo);

    this.#menu.moveToX(-500, 600, EasingFunction.OutExpo);
    this.#menu.fadeOut(400, EasingFunction.OutExpo);

    this.#header.hide();

    this.applyToBackground((background) => {
      background.scaleTo(0.85, 700, EasingFunction.OutExpo);
      background.fadeTo(0.2, 1000, EasingFunction.OutExpo);
    });

    // noop transform to delay when the container gets suspended
    this.fadeIn(600);

    super.onSuspending(e);
  }

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.show();
  }

  onResuming(e: ScreenTransitionEvent) {
    super.onResuming(e);

    this.show();
  }

  show() {
    this.#isActive = true;

    this.#carousel.moveToX(0, 400, EasingFunction.OutQuart);
    this.#carousel.scaleTo(1, 400, EasingFunction.OutQuart);
    this.#carousel.entryAnimation();
    this.#carousel.alpha = 1;

    this.#menu.moveToX(0, 400, EasingFunction.OutQuart);
    this.#menu.fadeIn(400);

    this.#header.show();

    this.globalSongPlayback.resume();

    this.applyToBackground((background) => {
      background.scaleTo(1, 500, EasingFunction.OutExpo);
      background.fadeTo(1, 300, EasingFunction.OutExpo);
    });

    this.fadeInFromZero(400);
  }

  get propagatePositionalInputSubTree(): boolean {
    return this.#isActive && super.propagatePositionalInputSubTree;
  }

  get propagateNonPositionalInputSubTree(): boolean {
    return this.#isActive && super.propagateNonPositionalInputSubTree;
  }
}
