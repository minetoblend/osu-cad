import { HitResult } from '@osucad/common';
import { ManiaJudgement } from './ManiaJudgement';

export class HoldNoteBodyJudgement extends ManiaJudgement {
  override get maxResult(): HitResult {
    return HitResult.IgnoreHit;
  }

  override get minResult(): HitResult {
    return HitResult.ComboBreak;
  }
}
