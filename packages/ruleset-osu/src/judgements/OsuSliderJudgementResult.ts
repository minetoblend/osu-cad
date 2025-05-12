import { OsuJudgementResult } from "./OsuJudgementResult";

export class OsuSliderJudgementResult extends OsuJudgementResult
{
  trackingHistory: TrackingEntry[] = [
    {
      time: Number.NEGATIVE_INFINITY,
      tracking: false,
    },
  ];
}

export interface TrackingEntry
{
  time: number;
  tracking: boolean;
}
