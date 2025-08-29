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
  public rawTime: number | null = null;

  public get timeOffset()
  {
    return this.rawTime !== null ? Math.min(this.rawTime - this.hitObject.endTime, this.hitObject.maximumJudgementOffset): 0;
  }

  /**
   * @internal
   * @param value
   */
  public set timeOffset(value)
  {
    this.rawTime = this.hitObject.endTime + value;
  }

  public get timeAbsolute()
  {
    return this.rawTime !== null ? Math.min(this.rawTime, this.hitObject.endTime + this.hitObject.maximumJudgementOffset) : this.hitObject.endTime;
  }

  public get hasResult()
  {
    return this.type > HitResult.None;
  }

  public get isHit()
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

  public constructor(
    public readonly hitObject: HitObject,
    public readonly judgement: Judgement,
  )
  {
    this.reset();
  }

  public reset()
  {
    this.type = HitResult.None;
    this.rawTime =null;
  }
}
