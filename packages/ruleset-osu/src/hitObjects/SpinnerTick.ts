import { OsuHitObject } from "./OsuHitObject";
import type { ControlPointInfo, HitSampleInfo, Judgement } from "@osucad/core";
import { HitResult, HitWindows } from "@osucad/core";
import { OsuJudgement } from "../judgements/OsuJudgement";

export class SpinnerTick extends OsuHitObject
{
  public constructor()
  {
    super({ type: "@osucad/spinner-tick", version: 0 });
  }

  public spinnerDuration: number = 0;

  public override createJudgement(): Judgement
  {
    return new OsuSpinnerTickJudgement();
  }

  protected override createHitWindows(): HitWindows
  {
    return HitWindows.Empty;
  }

  public override get maximumJudgementOffset(): number
  {
    return this.spinnerDuration;
  }

  protected override createSamples(controlPoints: ControlPointInfo): HitSampleInfo[]
  {
    return [];
  }
}

export class OsuSpinnerTickJudgement extends OsuJudgement
{
  public override get maxResult(): HitResult
  {
    return HitResult.SmallBonus;
  }
}
