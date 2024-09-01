import type { ScreenTransitionEvent } from 'osucad-framework';
import { Anchor, Axes, Box, Container, EasingFunction, dependencyLoader, resolved } from 'osucad-framework';
import gsap from 'gsap';
import { OsucadScreen } from '../OsucadScreen';
import { GlobalSongPlayback } from '../GlobalSongPlayback';
import { EditorEnvironment } from '../environment/EditorEnvironment';
import type { BeatmapStore } from '../environment/BeatmapStore';
import { BeatmapCarousel } from './BeatmapCarousel';
import { BeatmapSelectBackground } from './BeatmapSelectBackground';
import { BeatmapImportDropzone } from './BeatmapImportDropzone';
import { BeatmapSelectHeader } from './BeatmapSelectHeader';
import { BeatmapSelectFilter } from './BeatmapSelectFilter';

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
    this.beatmapStore = this.environment.createBeatmapStore();

    this.filter = new BeatmapSelectFilter(this.beatmapStore.beatmaps);

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
  }

  #menu!: Container;

  #header!: BeatmapSelectHeader;

  @resolved(GlobalSongPlayback)
  globalSongPlayback!: GlobalSongPlayback;

  #background!: BeatmapSelectBackground;

  #carousel!: BeatmapCarousel;

  onSuspending(e: ScreenTransitionEvent) {
    this.#carousel.fadeTo(0, 400, EasingFunction.OutExpo);
    this.#carousel.scaleTo(1.3, 600, EasingFunction.OutExpo);
    this.#carousel.moveToX(500, 600, EasingFunction.OutExpo);

    this.#menu.moveToX(-500, 600, EasingFunction.OutExpo);
    this.#menu.fadeOut(400, EasingFunction.OutExpo);

    this.#background.fadeTo(0.1, 300);

    this.#header.hide();

    gsap.to(this.#background, {
      scaleX: 0.85,
      scaleY: 0.85,
      duration: 0.6,
      ease: 'expo.out',
    });

    // noop transform to delay when the container gets suspended
    this.fadeIn(600);

    super.onSuspending(e);
  }

  onResuming(e: ScreenTransitionEvent) {
    this.#carousel.moveToX(0, 400, EasingFunction.OutQuart);
    this.#carousel.scaleTo(1, 400, EasingFunction.OutQuart);
    this.#carousel.entryAnimation();
    this.#carousel.alpha = 1;

    this.#menu.moveToX(0, 400, EasingFunction.OutQuart);
    this.#menu.fadeIn(400);

    this.#header.show();

    this.#background.fadeTo(0.3, 300);
    this.globalSongPlayback.resume();

    gsap.to(this.#background, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.5,
      ease: 'expo.out',
    });

    this.fadeInFromZero(400);

    super.onResuming(e);
  }
}
