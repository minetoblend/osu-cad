import type { HoldNoteBody } from '../HoldNoteBody';
import { DrawableManiaHitObject } from './DrawableManiaHitObject';

export class DrawableHoldNoteBody extends DrawableManiaHitObject<HoldNoteBody> {
  constructor(hitObject?: HoldNoteBody) {
    super(hitObject);
  }

  triggerResult(hit: boolean) {
    if (this.allJudged)
      return;

    if (hit)
      this.applyMaxResult();
    else
      this.applyMinResult();
  }
}
