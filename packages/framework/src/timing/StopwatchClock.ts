import type { IAdjustableClock } from "./IAdjustableClock";

export class StopwatchClock implements IAdjustableClock 
{
  constructor(start = true) 
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

  get isRunning() 
  {
    return this.#isRunning;
  }

  get currentTime() 
  {
    return this.#stopwatchCurrentTime + this.#seekOffset;
  }

  get #stopwatchCurrentTime() 
  {
    return (this.#stopwatchMilliseconds - this.#rateChangeUsed) * this.#rate + this.#rateChangeAccumulated;
  }

  start() 
  {
    if (this.#isRunning)
      return;
    this.#startTime = performance.now();
    this.#isRunning = true;
  }

  stop() 
  {
    if (!this.#isRunning)
      return;
    this.#seekOffset = this.#stopwatchCurrentTime;
    this.#isRunning = false;
  }

  get rate() 
  {
    return this.#rate;
  }

  set rate(value) 
  {
    if (this.#rate === value)
      return;

    const stopwatchMilliseconds = performance.now();
    this.#rateChangeAccumulated += (stopwatchMilliseconds - this.#rateChangeUsed) * this.#rate;
    this.#rateChangeUsed = stopwatchMilliseconds;

    this.#rate = value;
  }

  reset() 
  {
    this.#resetAccumulatedRate();
  }

  resetSpeedAdjustments() 
  {
    this.rate = 1;
  }

  seek(position: number) 
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
