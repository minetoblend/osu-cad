import type { IBeatmapTiming } from "./IBeatmapTiming";
import type { ITimingInfo } from "./ITimingInfo";
import type { LegacyTimingPoint } from "./LegacyTimingPoint";

const defaultTimingInfo: ITimingInfo = { beatLength: 60_000 / 180, signature: 4, startTime: 0 };


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

  public getSliderVelocityAt(time: number): number
  {
    const timingPoint = this._timingPoints.findLast(
        timingPoint => timingPoint.startTime <= time,
    );

    return timingPoint?.sliderVelocity ?? 1;
  }
}
