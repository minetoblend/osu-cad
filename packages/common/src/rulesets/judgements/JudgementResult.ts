import type { HitObject } from '../../hitObjects/HitObject';
import type { Judgement } from './Judgement';
import { HitResult } from '../../hitObjects/HitResult';

export class JudgementResult {
  public type!: HitResult;

  /** @internal */
  rawTime: number | null = null;

  get timeOffset() {
    return this.rawTime !== null ? Math.min(this.rawTime! - this.hitObject.endTime, this.hitObject.maximumJudgementOffset) : 0;
  }

  set timeOffset(value: number) {
    this.rawTime = this.hitObject.endTime + value;
  }

  get absoluteTime() {
    return this.rawTime !== null ? Math.min(this.rawTime!, this.hitObject.endTime + this.hitObject.maximumJudgementOffset) : this.hitObject.endTime;
  }

  get hasResult() {
    return this.type > HitResult.None;
  }

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

  get healthIncrease() {
    return this.judgement.healthIncreaseFor(this.type);
  }

  constructor(
    public readonly hitObject: HitObject,
    public readonly judgement: Judgement,
  ) {
    this.reset();
  }

  reset() {
    this.type = HitResult.None;
    this.rawTime = null;
  }
}
