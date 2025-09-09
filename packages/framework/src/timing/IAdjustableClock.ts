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

export function isAdjustableClock(obj: IClock): obj is IAdjustableClock
{
  return "reset" in obj && typeof "reset" === "function"
      && "start" in obj && typeof "start" === "function"
      && "stop" in obj && typeof "stop" === "function"
      && "seek" in obj && typeof "seek" === "function";
}
