import type { ScreenTransitionEvent } from 'osucad-framework';
import { Anchor, Axes, Box, dependencyLoader, resolved } from 'osucad-framework';
import gsap from 'gsap';
import { OsucadScreen } from '../OsucadScreen';
import { GlobalSongPlayback } from '../GlobalSongPlayback';
import { BeatmapCarousel } from './BeatmapCarousel';
import { BeatmapSelectBackground } from './BeatmapSelectBackground';

export class BeatmapSelect extends OsucadScreen {
  getPath(): string {
    return '/';
  }

  constructor() {
    super();

    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
  }

  @dependencyLoader()
  load() {
    this.addInternal(new Box({
      relativeSizeAxes: Axes.Both,
      color: 0x0B0B0D,
      size: 2,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));

    this.addAllInternal(
      this.#background = new BeatmapSelectBackground(),
      this.#carousel = new BeatmapCarousel()
        .apply({
          width: 0.6,
          anchor: Anchor.CenterRight,
          origin: Anchor.CenterRight,
        }),
    );

    this.#carousel.bleedTop = 200;
    this.#carousel.bleedBottom = 200;

    this.#carousel.selectionChanged.addListener((beatmap) => {
      this.#background.currentBeatmap = beatmap;
      this.globalSongPlayback.playAudio(beatmap.links.audioUrl, 10000);
    });
  }

  @resolved(GlobalSongPlayback)
  globalSongPlayback!: GlobalSongPlayback;

  #background!: BeatmapSelectBackground;

  #carousel!: BeatmapCarousel;

  onSuspending(e: ScreenTransitionEvent) {
    this.#carousel.fadeTo({ alpha: 0, duration: 400, easing: 'expo.out' });
    this.#carousel.scaleTo({ scale: 1.3, easing: 'expo.out', duration: 600 });
    this.#carousel.moveTo({ x: 500, duration: 600, easing: 'expo.out' });

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

    this.#background.fadeTo({ alpha: 0.5, duration: 300 });
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
