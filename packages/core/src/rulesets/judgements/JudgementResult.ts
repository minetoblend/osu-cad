import { HitResult } from "../scoring/HitResult";
import type { HitObject } from "../hitObjects";
import type { Judgement } from "./Judgement";

export class JudgementResult
{

  public type: HitResult = HitResult.None;

  // judgement

  /**
   * @internal
   */
  rawTime: number | null = null;

  get timeOffset()
  {
    return this.rawTime !== null ? Math.min(this.rawTime - this.hitObject.endTime, this.hitObject.maximumJudgementOffset): 0;
  }

  /**
   * @internal
   * @param value
   */
  set timeOffset(value)
  {
    this.rawTime = this.hitObject.endTime + value;
  }

  get timeAbsolute()
  {
    return this.rawTime !== null ? Math.min(this.rawTime, this.hitObject.endTime + this.hitObject.maximumJudgementOffset) : this.hitObject.endTime;
  }

  get hasResult()
  {
    return this.type > HitResult.None;
  }

  get isHit()
  {
    switch (this.type)
    {
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

  constructor(
    readonly hitObject: HitObject,
    readonly judgement: Judgement,
  )
  {
    this.reset();
  }

  reset()
  {
    this.type = HitResult.None;
    this.rawTime =null;
  }
}
