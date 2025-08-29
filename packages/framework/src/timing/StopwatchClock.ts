import type { IAdjustableClock } from "./IAdjustableClock";

export class StopwatchClock implements IAdjustableClock
{
  public constructor(start = true)
  {
    if (start)
    {
      this.start();
    }
  }

  #seekOffset = 0;
  #rate = 1;
  #rateChangeUsed = 0;
  #rateChangeAccumulated = 0;
  #isRunning = false;

  get #stopwatchMilliseconds()
  {
    if (!this.#isRunning)
    {
      return 0;
    }
    return performance.now() - this.#startTime;
  }

  #startTime = 0;

  public get isRunning()
  {
    return this.#isRunning;
  }

  public get currentTime()
  {
    return this.#stopwatchCurrentTime + this.#seekOffset;
  }

  get #stopwatchCurrentTime()
  {
    return (this.#stopwatchMilliseconds - this.#rateChangeUsed) * this.#rate + this.#rateChangeAccumulated;
  }

  public start()
  {
    if (this.#isRunning)
      return;
    this.#startTime = performance.now();
    this.#isRunning = true;
  }

  public stop()
  {
    if (!this.#isRunning)
      return;
    this.#seekOffset = this.#stopwatchCurrentTime;
    this.#isRunning = false;
  }

  public get rate()
  {
    return this.#rate;
  }

  public set rate(value)
  {
    if (this.#rate === value)
      return;

    const stopwatchMilliseconds = performance.now();
    this.#rateChangeAccumulated += (stopwatchMilliseconds - this.#rateChangeUsed) * this.#rate;
    this.#rateChangeUsed = stopwatchMilliseconds;

    this.#rate = value;
  }

  public reset()
  {
    this.#resetAccumulatedRate();
  }

  public resetSpeedAdjustments()
  {
    this.rate = 1;
  }

  public seek(position: number)
  {
    this.#seekOffset = position - this.#stopwatchCurrentTime;

    return true;
  }

  #resetAccumulatedRate()
  {
    this.#rateChangeAccumulated = 0;
    this.#rateChangeUsed = 0;
  }
}
