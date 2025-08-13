import type { ControlPointInfo, Judgement } from "@osucad/core";
import { HitResult, HitSampleInfo } from "@osucad/core";
import { OsuSpinnerTickJudgement, SpinnerTick } from "./SpinnerTick";

export class SpinnerBonusTick extends SpinnerTick
{
  override createJudgement(): Judgement
  {
    return super.createJudgement();
  }

  protected override createSamples(controlPoints: ControlPointInfo): HitSampleInfo[]
  {
    return [new HitSampleInfo("spinnerbonus")];
  }
}

export class OsuSpinnerBonusTickJudgement extends OsuSpinnerTickJudgement
{
  override get maxResult(): HitResult
  {
    return HitResult.LargeBonus;
  }
}
