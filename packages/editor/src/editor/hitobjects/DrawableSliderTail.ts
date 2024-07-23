import { Anchor, CompositeDrawable, dependencyLoader } from 'osucad-framework';
import type { Slider } from '@osucad/common';
import { AnimatedCirclePiece } from './AnimatedCirclePiece';

export class DrawableSliderTail extends CompositeDrawable {
  constructor(
    readonly slider: Slider,
    repeatIndex: number,
  ) {
    super();
    this.origin = Anchor.Center;

    this.#repeatIndex = repeatIndex;
  }

  #circlePiece!: AnimatedCirclePiece;

  #repeatIndex: number;

  get repeatIndex() {
    return this.#repeatIndex;
  }

  set repeatIndex(value: number) {
    if (this.#repeatIndex === value)
      return;

    this.#repeatIndex = value;

    this.#setup();
  }

  @dependencyLoader()
  load() {
    this.addInternal(this.#circlePiece = new AnimatedCirclePiece());

    this.slider.onUpdate.addListener(() => this.#setup());

    this.#setup();
  }

  #setup() {
    this.#circlePiece.comboColor = this.slider.comboColor;

    let timeFadeIn = this.slider.startTime - this.slider.timePreempt;

    if (this.repeatIndex === 0) {
      timeFadeIn += this.slider.timePreempt / 3;
    }

    this.#circlePiece.timeFadeIn = timeFadeIn;
    this.#circlePiece.fadeInDuration = this.slider.timeFadeIn;
    this.#circlePiece.timeFadeOut = this.slider.startTime + this.slider.spanDuration * (this.repeatIndex + 1);
  }
}
