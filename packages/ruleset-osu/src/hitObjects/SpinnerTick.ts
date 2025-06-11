import { OsuHitObject } from "./OsuHitObject";
import type { HitSampleInfo, IBeatmapTiming, Judgement } from "@osucad/core";
import { HitResult, HitWindows } from "@osucad/core";
import { OsuJudgement } from "../judgements/OsuJudgement";

export class SpinnerTick extends OsuHitObject
{
  public spinnerDuration: number = 0;

  override createJudgement(): Judgement
  {
    return new OsuSpinnerTickJudgement();
  }

  protected override createHitWindows(): HitWindows
  {
    return HitWindows.Empty;
  }

  override get maximumJudgementOffset(): number
  {
    return this.spinnerDuration;
  }

  protected override createSamples(timing: IBeatmapTiming): HitSampleInfo[]
  {
    return [];
  }
}

export class OsuSpinnerTickJudgement extends OsuJudgement
{
  override get maxResult(): HitResult
  {
    return HitResult.SmallBonus;
  }
}
