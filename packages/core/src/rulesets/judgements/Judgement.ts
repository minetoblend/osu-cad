import { HitResult } from '../../hitObjects/HitResult';
import { JudgementResult } from './JudgementResult';

const DEFAULT_MAX_HEALTH_INCREASE = 0.5;

export class Judgement {
  get maxResult(): HitResult {
    return HitResult.Perfect;
  }

  get minResult(): HitResult {
    switch (this.maxResult) {
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

  get maxHealthIncrease() {
    return this.healthIncreaseFor(this.maxResult);
  }

  healthIncreaseFor(result: HitResult | JudgementResult) {
    if (result instanceof JudgementResult)
      result = result.type;

    switch (result) {
      case HitResult.SmallTickHit:
        return DEFAULT_MAX_HEALTH_INCREASE * 0.5;

      case HitResult.SmallTickMiss:
        return -DEFAULT_MAX_HEALTH_INCREASE * 0.5;

      case HitResult.SliderTailHit:
      case HitResult.LargeTickHit:
        return DEFAULT_MAX_HEALTH_INCREASE;

      case HitResult.LargeTickMiss:
        return -DEFAULT_MAX_HEALTH_INCREASE;

      case HitResult.Miss:
        return -DEFAULT_MAX_HEALTH_INCREASE * 2;

      case HitResult.Meh:
        return DEFAULT_MAX_HEALTH_INCREASE * 0.05;

      case HitResult.Ok:
        return DEFAULT_MAX_HEALTH_INCREASE * 0.5;

      case HitResult.Good:
        return DEFAULT_MAX_HEALTH_INCREASE * 0.75;

      case HitResult.Great:
        return DEFAULT_MAX_HEALTH_INCREASE;

      case HitResult.Perfect:
        return DEFAULT_MAX_HEALTH_INCREASE * 1.05;

      case HitResult.SmallBonus:
        return DEFAULT_MAX_HEALTH_INCREASE * 0.5;

      case HitResult.LargeBonus:
        return DEFAULT_MAX_HEALTH_INCREASE;

      default:
        return 0;
    }
  }

  [Symbol.toStringTag]() {
    return `MaxResult:${HitResult[this.maxResult]}`;
  }
}
