import { HitResult } from "../scoring/HitResult";

export class Judgement
{
  get maxResult(): HitResult
  {
    return HitResult.Perfect;
  }

  get minResult()
  {
    switch (this.maxResult)
    {
    case HitResult.SmallBonus:
    case HitResult.LargeBonus:
    case HitResult.IgnoreHit:
      return HitResult.IgnoreMiss;

    case HitResult.SmallTickHit:
      return HitResult.SmallTickMiss;

    case HitResult.LargeTickHit:
      return HitResult.LargeTickMiss;

    case HitResult.SliderTailHit:
      return HitResult.IgnoreMiss;

    default:
      return HitResult.Miss;
    }
  }
}
