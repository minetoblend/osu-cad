import type { IAdjustableClock } from "./IAdjustableClock";

export class TestClock implements IAdjustableClock
{
  public accessor currentTime = 0;

  public accessor rate = 1;

  public get isRunning()
  {
    return this.#isRunning;
  }

  #isRunning = false;

  public reset()
  {
    this.currentTime = 0;
    this.#isRunning = false;
  }

  public start()
  {
    this.#isRunning = true;
  }

  public stop()
  {
    this.#isRunning = false;
  }

  public seek(position: number): boolean
  {
    this.currentTime = position;
    return true;
  }

  public resetSpeedAdjustments()
  {
    throw new Error("Not implemented");
  }
}
