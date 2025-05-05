import type { IClock } from "./IClock";

export interface IAdjustableClock extends IClock
{
  reset: () => void;
  start: () => void;
  stop: () => void;
  seek: (position: number) => boolean;
  get rate(): number;
  set rate(value: number);
  resetSpeedAdjustments: () => void;
}
