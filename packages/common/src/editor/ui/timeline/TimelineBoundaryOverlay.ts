import type { Drawable } from 'osucad-framework';
import { Anchor, Axes, Box, dependencyLoader, resolved } from 'osucad-framework';
import { Timeline } from './Timeline';
import { TimelinePart } from './TimelinePart';

export class TimelineBoundaryOverlay extends TimelinePart {
  constructor() {
    super();

    this.alpha = 0.5;
  }

  #startBoundaryOverlay!: Drawable;
  #endBoundaryOverlay!: Drawable;

  @resolved(Timeline)
  timeline!: Timeline;

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(
      this.#startBoundaryOverlay = new Box({
        relativePositionAxes: Axes.X,
        relativeSizeAxes: Axes.Both,
        color: 0x000000,
        anchor: Anchor.TopLeft,
        origin: Anchor.TopRight,
        width: 10000,
      }),
      this.#endBoundaryOverlay = new Box({
        relativePositionAxes: Axes.X,
        relativeSizeAxes: Axes.Both,
        color: 0x000000,
        anchor: Anchor.TopRight,
        origin: Anchor.TopLeft,
        width: 10000,
      }),
    );
  }
}
