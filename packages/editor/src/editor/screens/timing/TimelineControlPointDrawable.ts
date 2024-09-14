import { Anchor, Axes, Box, CompositeDrawable, dependencyLoader, resolved } from 'osucad-framework';
import { Timeline } from '../../timeline/Timeline.ts';
import { ControlPointGroup } from '../../../beatmap/timing/ControlPointGroup.ts';
import { TimingPoint } from '../../../beatmap/timing/TimingPoint.ts';
import { ThemeColors } from '../../ThemeColors.ts';

export class TimelineControlPointDrawable extends CompositeDrawable {

  constructor(readonly controlPoint: ControlPointGroup) {
    super();
  }

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Y;
    this.width = 8;
    this.anchor = Anchor.BottomLeft;
    this.origin = Anchor.BottomCenter;

    this.controlPoint.changed.addListener(() => this.scheduler.addOnce(this.#updateState, this))

    this.#updateState();
  }

  @resolved(ThemeColors)
  theme!: ThemeColors;

  #timingPoint!: TimingPoint;

  #updateState() {
    let isInherited = true;

    for (const child of this.controlPoint.children) {
      if (child instanceof TimingPoint)
        isInherited = false;
    }



  }

  protected loadComplete() {
    super.loadComplete();

    this.timeline = this.findClosestParentOfType(Timeline)!;
  }

  timeline!: Timeline;

  update() {
    this.x = this.timeline.timeToPosition(this.controlPoint.time);
  }

}
