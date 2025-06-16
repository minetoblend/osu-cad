import { Bindable, BindableNumber } from "@osucad/framework";
import type { ITimingInfo } from "./ITimingInfo";
import { SampleSet } from "../../audio/SampleSet";

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
    .withPrecision(0.01);

  get sliderVelocity()
  {
    return this.sliderVelocityBindable.value;
  }

  set sliderVelocity(value)
  {
    this.sliderVelocityBindable.value = value;
  }

  readonly sampleSetBindable = new Bindable<SampleSet>(SampleSet.None);

  get sampleSet()
  {
    return this.sampleSetBindable.value;
  }

  set sampleSet(value)
  {
    this.sampleSetBindable.value =value;
  }

  readonly sampleIndexBindable = new Bindable<number>(0);

  get sampleIndex()
  {
    return this.sampleIndexBindable.value;
  }

  set sampleIndex(value)
  {
    this.sampleIndexBindable.value = value;
  }

  readonly volumeBindable = new Bindable<number>(100);

  get volume()
  {
    return this.volumeBindable.value;
  }

  set volume(value)
  {
    this.volumeBindable.value = value;
  }
}
