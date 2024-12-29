import type { HitCircle } from '@osucad/common';
import { dependencyLoader } from 'osucad-framework';
import { TimelineComboNumber } from './TimelineComboNumber';
import { TimelineObject } from './TimelineObject';

export class TimelineHitCircle extends TimelineObject {
  constructor(hitObject: HitCircle) {
    super(hitObject);
  }

  @dependencyLoader()
  load() {
    this.add(new TimelineComboNumber(this.hitObject));
  }

  setup() {
    super.setup();
  }
}
