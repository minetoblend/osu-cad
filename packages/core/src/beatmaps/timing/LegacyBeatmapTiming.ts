import type { IBeatmapTiming } from "./IBeatmapTiming";
import type { ITimingInfo } from "./ITimingInfo";
import type { LegacyTimingPoint } from "./LegacyTimingPoint";

const defaultTimingInfo: ITimingInfo = { beatLength: 60_000 / 180, signature: 4, startTime: 0 };


export class LegacyBeatmapTiming implements IBeatmapTiming
{
  readonly timingPoints: LegacyTimingPoint[] = [];

  public getTimingInfoAt(time: number): ITimingInfo
  {
    const timingPoint = this.timingPoints.findLast(timingPoint =>
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
    const timingPoint = this.timingPoints.findLast(
        timingPoint => timingPoint.startTime <= time,
    );

    return timingPoint?.sliderVelocity ?? 1;
  }
}
