import { Anchor, Axes, Box, CompositeDrawable, dependencyLoader, resolved } from 'osucad-framework';
import { OsucadColors } from '../../../OsucadColors';
import { Timeline } from './Timeline';

export class CurrentTimeOverlay extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  #overlay = new Box({
    color: OsucadColors.primary,
    width: 2,
    relativeSizeAxes: Axes.Y,
    origin: Anchor.TopCenter,
  });

  @dependencyLoader()
  load() {
    this.addInternal(this.#overlay);
  }

  @resolved(Timeline)
  timeline!: Timeline;

  override update() {
    super.update();

    this.#overlay.x = this.timeline.timeToPosition(this.timeline.currentTime);
  }
}
