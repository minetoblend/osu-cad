import type { HitCircle } from '@osucad/common';
import type { ColorSource } from 'pixi.js';
import { dependencyLoader } from 'osucad-framework';
import { TimelineObject } from './TimelineObject';
import { TimelineComboNumber } from './TimelineComboNumber';

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

  protected applyComboColor(color: ColorSource) {
    super.applyComboColor(color);

    console.log(color);
  }
}
