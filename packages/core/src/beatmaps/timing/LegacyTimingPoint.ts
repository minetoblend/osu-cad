import { Bindable, BindableNumber } from "@osucad/framework";
import type { ITimingInfo } from "./ITimingInfo";
import { SampleSet } from "../../audio/SampleSet";

export class LegacyTimingPoint
{
  public readonly startTimeBindable = new Bindable(0);

  public get startTime()
  {
    return this.startTimeBindable.value;
  }

  public set startTime(value)
  {
    this.startTimeBindable.value = value;
  }

  public readonly timingInfoBindable = new Bindable<Omit<ITimingInfo, "startTime"> | null>(null);

  public get timingInfo()
  {
    return this.timingInfoBindable.value;
  }

  public set timingInfo(value)
  {
    this.timingInfoBindable.value = value;
  }

  public readonly sliderVelocityBindable = new BindableNumber(1)
    .withMinValue(0.1)
    .withMaxValue(10)
    .withPrecision(0.01);

  public get sliderVelocity()
  {
    return this.sliderVelocityBindable.value;
  }

  public set sliderVelocity(value)
  {
    this.sliderVelocityBindable.value = value;
  }

  public readonly sampleSetBindable = new Bindable<SampleSet>(SampleSet.None);

  public get sampleSet()
  {
    return this.sampleSetBindable.value;
  }

  public set sampleSet(value)
  {
    this.sampleSetBindable.value =value;
  }

  public readonly sampleIndexBindable = new Bindable<number>(0);

  public get sampleIndex()
  {
    return this.sampleIndexBindable.value;
  }

  public set sampleIndex(value)
  {
    this.sampleIndexBindable.value = value;
  }

  public readonly volumeBindable = new Bindable<number>(100);

  public get volume()
  {
    return this.volumeBindable.value;
  }

  public set volume(value)
  {
    this.volumeBindable.value = value;
  }
}
