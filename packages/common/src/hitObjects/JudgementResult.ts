import type { Vec2 } from 'osucad-framework';
import { HitResult } from './HitResult';

export class JudgementResult {
  constructor(
    public type: HitResult,
    public absoluteTime: number,
    public timeOffset: number,
    public position: Vec2,
  ) {}

  get isHit() {
    switch (this.type) {
      case HitResult.None:
      case HitResult.IgnoreMiss:
      case HitResult.Miss:
      case HitResult.SmallTickMiss:
      case HitResult.LargeTickMiss:
      case HitResult.ComboBreak:
        return false;

      default:
        return true;
    }
  }
}
