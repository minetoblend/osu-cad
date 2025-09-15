import type { IClock } from "./IClock";

export class TestNonAdjustableClock implements IClock
{
public accessor currentTime = 0

  public accessor rate = 1

  public get isRunning(): boolean
  {
    return true;
  }
}
