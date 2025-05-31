import { HitResult } from "@osucad/core";

export class OsuScoreProcessor
{

  public getBaseScoreForResult(result: HitResult)
  {
    switch (result)
    {
    default:
      return 0;

    case HitResult.SmallTickHit:
      return 10;

    case HitResult.LargeTickHit:
      return 30;

    case HitResult.SliderTailHit:
      return 150;

    case HitResult.Meh:
      return 50;

    case HitResult.Ok:
      return 100;

    case HitResult.Good:
      return 200;

    case HitResult.Great:
    case HitResult.Perfect: // Perfect doesn't actually give more score / accuracy directly.
      return 300;

    case HitResult.SmallBonus:
      return 10;

    case HitResult.LargeBonus:
      return 50;
    }
  }
}
