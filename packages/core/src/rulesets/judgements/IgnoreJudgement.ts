import { Judgement } from "./Judgement";
import { HitResult } from "../scoring/HitResult";

export class IgnoreJudgement extends Judgement
{
  public override get maxResult(): HitResult
  {
    return HitResult.IgnoreHit;
  }
}
