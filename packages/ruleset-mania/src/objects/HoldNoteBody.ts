import type { HitWindows } from '@osucad/common';
import { EmptyHitWindows } from '@osucad/common';
import { ManiaHitObject } from './ManiaHitObject';

export class HoldNoteBody extends ManiaHitObject {
  protected override createHitWindows(): HitWindows {
    return new EmptyHitWindows();
  }
}
