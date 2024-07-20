import type { ScreenTransitionEvent } from 'osucad-framework';
import { Anchor, Axes, Box, dependencyLoader } from 'osucad-framework';
import gsap from 'gsap';
import { OsucadScreen } from '../OsucadScreen';
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

    this.#carousel.selectionChanged.addListener((beatmap) => {
      this.#background.currentBeatmap = beatmap;
      this.#playAudio(beatmap.links.audioUrl);
    });
  }

  #background!: BeatmapSelectBackground;

  #carousel!: BeatmapCarousel;

  onSuspending(e: ScreenTransitionEvent) {
    this.#carousel.moveTo({ x: this.#carousel.drawSize.x, duration: 300, easing: 'power3.in' });
    this.#carousel.fadeTo({ alpha: 0.5, duration: 300 });

    if (this.#audio) {
      const audio = this.#audio;
      this.#audio = undefined;

      gsap.to(audio, { volume: 0, duration: 0.3 });
      setTimeout(() => {
        audio.pause();
        audio.remove();
      }, 300);
    }

    this.#background.fadeTo({ alpha: 0.8, duration: 300 });

    gsap.to(this.#background, {
      scaleX: 0.85,
      scaleY: 0.85,
      duration: 0.6,
      ease: 'expo.out',
    });

    // noop transform to delay when the container gets suspended
    this.fadeTo({ alpha: 1, duration: 400 });

    super.onSuspending(e);
  }

  onResuming(e: ScreenTransitionEvent) {
    this.#carousel.moveTo({ x: 0, duration: 400, easing: 'power4.out' });
    this.#carousel.entryAnimation();
    this.#carousel.alpha = 1;

    this.#background.fadeTo({ alpha: 0.5, duration: 300 });

    gsap.to(this.#background, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.5,
      ease: 'expo.out',
    });

    this.fadeIn({ duration: 400 });

    super.onResuming(e);
  }

  #audio?: HTMLAudioElement;

  #playAudio(url: string) {
    if (this.#audio?.src === url) {
      return;
    }

    const oldAudio = this.#audio;

    if (oldAudio) {
      gsap.to(oldAudio, { volume: 0, duration: 0.3 });
      setTimeout(() => {
        oldAudio.pause();
        oldAudio.remove();
      }, 300);
    }

    const audio = this.#audio = new Audio(url);

    audio.src = url;
    audio.autoplay = true;
    audio.loop = true;
    audio.currentTime = 10;
    audio.crossOrigin = 'anonymous';
    audio.volume = 0;
    audio.onplay = () => {
      gsap.to(audio, { volume: 0.5, duration: 0.3 });
    };
  }
}
