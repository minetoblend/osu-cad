import type { IClock } from "./IClock";

export interface IAdjustableClock extends IClock
{
  reset(): void;
  start(): void;
  stop(): void;
  seek(position: number): boolean;
  get rate(): number;
  set rate(value: number);
  resetSpeedAdjustments(): void;
}

export function isAdjustableClock(obj: IClock): obj is IAdjustableClock
{
  return "reset" in obj && typeof obj.reset === "function"
      && "start" in obj && typeof obj.start === "function"
      && "stop" in obj && typeof obj.stop === "function"
      && "seek" in obj && typeof obj.seek === "function";
}
