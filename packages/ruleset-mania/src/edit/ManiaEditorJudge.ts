import type { DrawableHitObject } from '@osucad/common';
import { HitObjectJudge } from '@osucad/common';

export class ManiaEditorJudge extends HitObjectJudge {
  override checkForResult(hitObject: DrawableHitObject, userTriggered: boolean, timeOffset: number): void {
    if (hitObject) {}
  }
}
