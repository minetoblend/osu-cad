import type { IClock } from "./IClock";

export class ManualClock implements IClock
{
  currentTime = 0;

  rate = 1;

  isRunning = false;
}
