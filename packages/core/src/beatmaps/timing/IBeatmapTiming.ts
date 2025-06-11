import type { ITimingInfo } from "./ITimingInfo";
import type { ISampleInfo } from "./LegacyBeatmapTiming";

export interface IBeatmapTiming
{
  getTimingInfoAt(time: number): ITimingInfo;

  getSliderVelocityAt(time: number): number;

  getSampleInfoAt(time: number): ISampleInfo
}
