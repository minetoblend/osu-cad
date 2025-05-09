import { HitResult, Judgement } from "@osucad/core";

export class OsuJudgement extends Judgement
{
  override get maxResult(): HitResult
  {
    return HitResult.Great;
  }
}
