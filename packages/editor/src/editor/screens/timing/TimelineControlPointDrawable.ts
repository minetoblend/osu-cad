import type { ControlPointGroup } from '../../../beatmap/timing/ControlPointGroup';
import type { TimingPoint } from '../../../beatmap/timing/TimingPoint';
import { Anchor, Axes, Box, CompositeDrawable, dependencyLoader, resolved } from 'osucad-framework';
import { ThemeColors } from '../../ThemeColors';
import { Timeline } from '../../timeline/Timeline';

export class TimelineControlPointDrawable extends CompositeDrawable {
  constructor(readonly controlPoint: ControlPointGroup) {
    super();
  }

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Y;
    this.width = 2;
    this.anchor = Anchor.BottomLeft;
    this.origin = Anchor.BottomCenter;

    this.addInternal(
      this.#line = new Box({
        relativeSizeAxes: Axes.Both,
      }),
    );

    this.controlPoint.changed.addListener(() => this.scheduler.addOnce(this.#updateState, this));

    this.#updateState();
  }

  #line!: Box;

  @resolved(ThemeColors)
  theme!: ThemeColors;

  #timingPoint!: TimingPoint;

  #updateState() {
    const isInherited = !this.controlPoint.timing;

    if (isInherited) {
      this.#line.color = this.theme.primary;
    }
    else {
      this.#line.color = 0xF03265;
    }
  }

  protected loadComplete() {
    super.loadComplete();

    this.timeline = this.findClosestParentOfType(Timeline)!;
  }

  timeline!: Timeline;

  update() {
    super.update();
    this.x = this.timeline.timeToPosition(this.controlPoint.time);
  }
}
