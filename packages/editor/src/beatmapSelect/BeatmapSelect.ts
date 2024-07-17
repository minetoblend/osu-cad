import type { ScreenTransitionEvent } from 'osucad-framework';
import { Anchor, Axes, Box } from 'osucad-framework';
import gsap from 'gsap';
import { OsucadScreen } from '../OsucadScreen';
import { BeatmapCarousel } from './BeatmapCarousel';

export class BeatmapSelect extends OsucadScreen {
  getPath(): string {
    return '/';
  }

  constructor() {
    super();

    this.addInternal(new Box({
      relativeSizeAxes: Axes.Both,
      color: 0x0B0B0D,
    }));

    this.addInternal(
      this.#carousel
        = new BeatmapCarousel()
          .apply({
            anchor: Anchor.Center,
            origin: Anchor.Center,
          }),
    );
  }

  #carousel: BeatmapCarousel;

  onSuspending(e: ScreenTransitionEvent) {
    gsap.to(this.#carousel, {
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 0.3,
      ease: 'power4.out',
      onComplete: () => {
        this.removeInternal(this.#carousel);
      },
    });
    this.fadeOut({ duration: 300 });

    super.onSuspending(e);
  }

  onResuming(e: ScreenTransitionEvent) {
    this.fadeIn({ duration: 300 });

    this.addInternal(this.#carousel = new BeatmapCarousel().apply({
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));

    gsap.from(this.#carousel, {
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 0.3,
      ease: 'power4.out',
    });

    super.onResuming(e);
  }
}
