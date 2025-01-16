import type { HitWindows, Judgement } from '@osucad/core';
import { EmptyHitWindows } from '@osucad/core';
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
