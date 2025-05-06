import type { ITimingInfo } from "./ITimingInfo";

export interface IBeatmapTiming
{
  getTimingInfoAt(time: number): ITimingInfo;

  getSliderVelocityAt(time: number): number;
}
