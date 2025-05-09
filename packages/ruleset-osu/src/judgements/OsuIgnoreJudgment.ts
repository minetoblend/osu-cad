import { HitResult } from "@osucad/core";
import { OsuJudgement } from "./OsuJudgement";

export class OsuIgnoreJudgment extends OsuJudgement
{
  override get maxResult(): HitResult
  {
    return HitResult.IgnoreHit;
  }
}
