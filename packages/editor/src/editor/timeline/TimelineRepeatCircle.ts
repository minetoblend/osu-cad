import { Anchor, Axes, CompositeDrawable, FillMode } from 'osucad-framework';
import type { Slider } from '@osucad/common';
import { FastRoundedBox } from '../../drawables/FastRoundedBox';

export class TimelineRepeatCircle extends CompositeDrawable {
  constructor(readonly hitObject: Slider, readonly index: number) {
    super();

    this.apply({
      relativeSizeAxes: Axes.Both,
      relativePositionAxes: Axes.X,
      size: 0.35,
      fillMode: FillMode.Fit,
      anchor: Anchor.CenterLeft,
      origin: Anchor.Center,
    });

    this.addInternal(
      this.#circle = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 100,
        alpha: 0.5,
      }),
    );
  }

  #circle: FastRoundedBox;

  onHover(): boolean {
    this.#circle.alpha = 0.6;

    return true;
  }

  onHoverLost(): boolean {
    this.#circle.alpha = 0.5;

    return true;
  }
}
