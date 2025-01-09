import type { HitWindows, Judgement } from '@osucad/common';
import { EmptyHitWindows } from '@osucad/common';
import { HoldNoteBodyJudgement } from '../judgements/HoldNoteBodyJudgement';
import { ManiaHitObject } from './ManiaHitObject';

export class HoldNoteBody extends ManiaHitObject {
  override createJudgement(): Judgement {
    return new HoldNoteBodyJudgement();
  }

  protected override createHitWindows(): HitWindows {
    return new EmptyHitWindows();
  }
}
