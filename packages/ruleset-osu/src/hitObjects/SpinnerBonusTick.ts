import type { Judgement } from "@osucad/core";
import { HitResult } from "@osucad/core";
import { OsuSpinnerTickJudgement, SpinnerTick } from "./SpinnerTick";

export class SpinnerBonusTick extends SpinnerTick
{
  override createJudgement(): Judgement
  {
    return super.createJudgement();
  }
}

export class OsuSpinnerBonusTickJudgement extends OsuSpinnerTickJudgement
{
  override get maxResult(): HitResult
  {
    return HitResult.LargeBonus;
  }
}
