import type { IClock } from "./IClock";

export class ManualClock implements IClock
{
  public currentTime = 0;

  public rate = 1;

  public isRunning = false;
}
