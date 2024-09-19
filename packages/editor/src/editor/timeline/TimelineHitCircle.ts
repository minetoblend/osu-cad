import type { ColorSource } from 'pixi.js';
import type { HitCircle } from '../../beatmap/hitObjects/HitCircle';
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

  protected applyComboColor(color: ColorSource) {
    super.applyComboColor(color);

    console.log(color);
  }
}
