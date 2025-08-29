import { HitResult } from "@osucad/core";
import { OsuJudgement } from "./OsuJudgement";

export class OsuIgnoreJudgment extends OsuJudgement
{
  public override get maxResult(): HitResult
  {
    return HitResult.IgnoreHit;
  }
}
