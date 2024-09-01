import type { Spinner } from '../../beatmap/hitObjects/Spinner';
import { TimelineObject } from './TimelineObject';
import { TimelineSpinnerHead } from './TimelineSpinnerHead';
import { TimelineSpinnerTail } from './TimelineSpinnerTail';

export class TimelineSpinner extends TimelineObject<Spinner> {
  constructor(hitObject: Spinner) {
    super(hitObject);
  }

  setup() {
    super.setup();

    this.body.outline.alpha = 0;

    this.addAll(
      new TimelineSpinnerTail(this.hitObject),
      new TimelineSpinnerHead(this.hitObject,
      ),
    );
  }
}
