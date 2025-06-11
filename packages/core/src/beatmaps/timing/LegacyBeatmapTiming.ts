import type { IBeatmapTiming } from "./IBeatmapTiming";
import type { ITimingInfo } from "./ITimingInfo";
import type { LegacyTimingPoint } from "./LegacyTimingPoint";
import { SampleSet } from "../../audio/SampleSet";

const defaultTimingInfo: ITimingInfo = { beatLength: 60_000 / 180, signature: 4, startTime: 0 };

export interface ISampleInfo
{
  volume: number,
  sampleSet: SampleSet,
  sampleIndex: number,
}

export class LegacyBeatmapTiming implements IBeatmapTiming
{
  private readonly _timingPoints: LegacyTimingPoint[] = [];

  get timingPoints(): readonly LegacyTimingPoint[]
  {
    return this._timingPoints as readonly LegacyTimingPoint[];
  }

  public add(timingPoint: LegacyTimingPoint)
  {
    this._timingPoints.push(timingPoint);
    this._timingPoints.sort((a, b) => a.startTime - b.startTime);
  }

  public remove(timingPoint: LegacyTimingPoint)
  {
    const index = this._timingPoints.indexOf(timingPoint);
    if (index < 0)
      return false;

    this._timingPoints.splice(index, 1);
    return true;
  }

  public getTimingInfoAt(time: number): ITimingInfo
  {
    const timingPoint = this._timingPoints.findLast(timingPoint =>
    {
      if (!timingPoint.timingInfo)
        return false;

      return timingPoint.startTime <= time;
    });

    if (!timingPoint?.timingInfo)
      return defaultTimingInfo;

    return { ...timingPoint.timingInfo, startTime: timingPoint.startTime };
  }

  public getSampleInfoAt(time: number): ISampleInfo
  {
    const timingPoint = this._timingPoints.findLast(timingPoint => timingPoint.startTime <= time);

    if (!timingPoint)
    {
      return {
        volume: 100,
        sampleSet: SampleSet.Normal,
        sampleIndex: 0,
      };
    }

    return {
      volume: timingPoint.volume,
      sampleSet: timingPoint.sampleSet,
      sampleIndex: timingPoint.sampleIndex,
    };
  }

  public getSliderVelocityAt(time: number): number
  {
    const timingPoint = this._timingPoints.findLast(
        timingPoint => timingPoint.startTime <= time,
    );

    return timingPoint?.sliderVelocity ?? 1;
  }
}
