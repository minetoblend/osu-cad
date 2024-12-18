import type { Drawable } from 'osucad-framework';
import { Anchor, Axes, Box, CompositeDrawable, dependencyLoader, resolved } from 'osucad-framework';
import { EditorClock } from '../../EditorClock';
import { Timeline } from './Timeline';

export class TimelineBoundaryOverlay extends CompositeDrawable {
  constructor() {
    super();

    this.alpha = 0.5;
  }

  #startBoundaryOverlay!: Drawable;
  #endBoundaryOverlay!: Drawable;

  @resolved(Timeline)
  timeline!: Timeline;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(
      this.#startBoundaryOverlay = new Box({
        relativeSizeAxes: Axes.Y,
        color: 0x000000,
      }),
      this.#endBoundaryOverlay = new Box({
        relativeSizeAxes: Axes.Y,
        color: 0x000000,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
      }),
    );
  }

  override update() {
    super.update();

    const startTimeX = this.timeline.timeToPosition(0);
    const endTimeX = this.timeline.timeToPosition(this.editorClock.trackLength);

    if (startTimeX < 0) {
      this.#startBoundaryOverlay.alpha = 0;
    }
    else {
      this.#startBoundaryOverlay.alpha = 1;
      this.#startBoundaryOverlay.width = startTimeX;
    }

    if (endTimeX > this.drawWidth) {
      this.#endBoundaryOverlay.alpha = 0;
    }
    else {
      this.#endBoundaryOverlay.alpha = 1;
      this.#endBoundaryOverlay.width = this.drawWidth - endTimeX;
    }
  }
}
