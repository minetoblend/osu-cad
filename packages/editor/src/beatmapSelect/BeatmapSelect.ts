import type { ScreenTransitionEvent } from 'osucad-framework';
import { Anchor, Axes, Box, Container, dependencyLoader, resolved } from 'osucad-framework';
import gsap from 'gsap';
import { OsucadScreen } from '../OsucadScreen';
import { GlobalSongPlayback } from '../GlobalSongPlayback';
import { EditorEnvironment } from '../environment/EditorEnvironment';
import type { BeatmapStore } from '../environment/BeatmapStore';
import { BeatmapCarousel } from './BeatmapCarousel';
import { BeatmapSelectBackground } from './BeatmapSelectBackground';
import { BeatmapImportDropzone } from './BeatmapImportDropzone';
import { BeatmapSelectSearchHeader } from './BeatmapSelectSearchHeader';

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

  @dependencyLoader()
  load() {
    this.beatmapStore = this.environment.createBeatmapStore();

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
            .apply({
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
          new BeatmapSelectSearchHeader().apply({
            relativeSizeAxes: Axes.X,
            anchor: Anchor.TopRight,
            origin: Anchor.TopRight,
            height: 150,
          }),
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

  @resolved(GlobalSongPlayback)
  globalSongPlayback!: GlobalSongPlayback;

  #background!: BeatmapSelectBackground;

  #carousel!: BeatmapCarousel;

  onSuspending(e: ScreenTransitionEvent) {
    this.#carousel.fadeTo({ alpha: 0, duration: 400, easing: 'expo.out' });
    this.#carousel.scaleTo({ scale: 1.3, easing: 'expo.out', duration: 600 });
    this.#carousel.moveTo({ x: 500, duration: 600, easing: 'expo.out' });

    this.#menu.moveTo({ x: -500, duration: 600, easing: 'expo.out' });
    this.#menu.fadeOut({ duration: 400, easing: 'expo.out' });

    this.#background.fadeTo({ alpha: 0.1, duration: 300 });

    gsap.to(this.#background, {
      scaleX: 0.85,
      scaleY: 0.85,
      duration: 0.6,
      ease: 'expo.out',
    });

    // noop transform to delay when the container gets suspended
    this.fadeTo({ alpha: 1, duration: 600 });

    super.onSuspending(e);
  }

  onResuming(e: ScreenTransitionEvent) {
    this.#carousel.moveTo({ x: 0, duration: 400, easing: 'power4.out' });
    this.#carousel.scaleTo({ scale: 1, duration: 400, easing: 'power4.out' });
    this.#carousel.entryAnimation();
    this.#carousel.alpha = 1;

    this.#menu.moveTo({ x: 0, duration: 400, easing: 'power4.out' });
    this.#menu.fadeIn({ duration: 400 });

    this.#background.fadeTo({ alpha: 0.3, duration: 300 });
    this.globalSongPlayback.resume();

    gsap.to(this.#background, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.5,
      ease: 'expo.out',
    });

    this.fadeIn({ duration: 400 });

    super.onResuming(e);
  }
}
