import { Bindable, BindableNumber } from "@osucad/framework";
import type { ITimingInfo } from "./ITimingInfo";

export class LegacyTimingPoint
{
  readonly startTimeBindable = new Bindable(0);

  get startTime()
  {
    return this.startTimeBindable.value;
  }

  set startTime(value)
  {
    this.startTimeBindable.value = value;
  }

  readonly timingInfoBindable = new Bindable<Omit<ITimingInfo, "startTime"> | null>(null);

  get timingInfo()
  {
    return this.timingInfoBindable.value;
  }

  set timingInfo(value)
  {
    this.timingInfoBindable.value = value;
  }

  readonly sliderVelocityBindable = new BindableNumber(1)
    .withMinValue(0.1)
    .withMaxValue(10)
    .withPrecision(0.1);

  get sliderVelocity()
  {
    return this.sliderVelocityBindable.value;
  }

  set sliderVelocity(value)
  {
    this.sliderVelocityBindable.value = value;
  }
}
