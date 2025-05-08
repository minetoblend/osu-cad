import { BindableNumber, Vec2 } from "@osucad/framework";
import type { OsuHitObjectOptions } from "./OsuHitObject";
import { OsuHitObject } from "./OsuHitObject";
import { HitWindows, safeAssign } from "@osucad/core";

const zero_vector = Vec2.zero();

export interface SpinnerOptions extends OsuHitObjectOptions
{
  duration?: number
}

export class Spinner extends OsuHitObject
{
  constructor(options: SpinnerOptions = {})
  {
    const { duration, ...rest } = options;

    super(rest);

    safeAssign(this, { duration });
  }

  readonly durationBindable = new BindableNumber(0)
    .withMinValue(0);


  override get duration()
  {
    return this.durationBindable.value;
  }

  override set duration(value: number)
  {
    this.durationBindable.value = value;
  }

  override get endTime()
  {
    return this.startTime + this.duration;
  }

  override set endTime(value: number)
  {
    this.duration = value - this.startTime;
  }

  override get stackOffset()
  {
    return zero_vector;
  }

  protected override createHitWindows()
  {
    return HitWindows.Empty;
  }
}
