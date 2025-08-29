import { HitResult, Judgement } from "@osucad/core";

export class OsuJudgement extends Judgement
{
  public override get maxResult(): HitResult
  {
    return HitResult.Great;
  }
}
