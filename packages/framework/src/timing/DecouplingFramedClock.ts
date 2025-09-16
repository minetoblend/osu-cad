import { debugAssert } from "../utils/debugAssert";
import type { FrameTimeInfo } from "./FrameTimeInfo";
import type { IAdjustableClock } from "./IAdjustableClock";
import { isAdjustableClock } from "./IAdjustableClock";
import type { IClock } from "./IClock";
import type { IFrameBasedClock } from "./IFrameBasedClock";
import { isFrameBasedClock } from "./IFrameBasedClock";
import type { ISourceChangeableClock } from "./ISourceChangeableClock";
import { StopwatchClock } from "./StopwatchClock";

export class DecouplingFramedClock implements ISourceChangeableClock, IAdjustableClock, IFrameBasedClock
{
  public readonly isFrameBasedClock: true = true as const;

  public allowDecoupling = true;

  public get isRunning()
  {
    return this.#isRunning;
  }

  #isRunning = false;

  public get currentTime()
  {
    return this.#currentTime;
  }

  #currentTime = 0;

  public get elapsedFrameTime()
  {
    return this.#elapsedFrameTime;
  }

  #elapsedFrameTime = 0;

  public get framesPerSecond()
  {
    return 0;
  }

  #shouldBeRunning = false;

  #currentTimeInternal = 0;

  #lastReferenceTime?: number;

  #lastSeekFailed = false;

  #realtimeReferenceClock = new StopwatchClock(true);

  #adjustableSourceClock: IAdjustableClock;

  #pendingSourceRestartAfterNegativeSeek = false;

  public constructor(source?: IClock)
  {
    this.changeSource(source);
    debugAssert(!!this.source);
    debugAssert(!!this.#adjustableSourceClock);
  }

  public get timeInfo(): FrameTimeInfo
  {
    return {
      current: this.currentTime,
      elapsed: this.elapsedFrameTime,
    };
  }

  public processFrame()
  {
    const lastTime = this.currentTime;

    if (isFrameBasedClock(this.source))
      this.source.processFrame();

    try
    {
      if (this.source.isRunning)
      {
        this.#currentTimeInternal = this.source.currentTime;
        this.#shouldBeRunning = true;
        return;
      }

      if (!this.allowDecoupling)
      {
        this.#currentTimeInternal = this.source.currentTime;
        this.#shouldBeRunning = false;
        return;
      }

      if (!this.#shouldBeRunning)
        return;

      if (this.#lastReferenceTime === undefined)
        return;

      const elapsedReferenceTime = (this.#realtimeReferenceClock.currentTime - this.#lastReferenceTime) * this.rate;

      this.#currentTimeInternal += elapsedReferenceTime;

      if (this.#pendingSourceRestartAfterNegativeSeek && this.#currentTimeInternal >= 0)
      {
        this.#pendingSourceRestartAfterNegativeSeek = false;

        this.#lastSeekFailed = !this.#adjustableSourceClock.seek(this.#currentTimeInternal);
        if (!this.#lastSeekFailed)
          this.#adjustableSourceClock.start();
      }
    }
    finally
    {
      this.#isRunning = this.#shouldBeRunning;
      this.#lastReferenceTime = this.#realtimeReferenceClock.currentTime;
      this.#currentTime = this.#currentTimeInternal;
      this.#elapsedFrameTime = this.currentTime - lastTime;
    }
  }

  // #region ISourceChangeableClock implementation
  #source!: IClock;

  public get source(): IClock
  {
    return this.#source;
  }

  public changeSource(source?: IClock)
  {
    this.#source = source ?? new StopwatchClock(true);

    if (!isAdjustableClock(this.#source))
      throw new Error("Clock must be of type IAdjustableClock");

    this.#adjustableSourceClock = this.#source;
    this.#currentTimeInternal = this.#adjustableSourceClock.currentTime;
    this.#shouldBeRunning = this.#source.isRunning;
    this.#lastSeekFailed = false;
  }

  // #endregion

  // #region IAdjustableClock
  public reset()
  {
    this.#adjustableSourceClock.reset();
    this.#pendingSourceRestartAfterNegativeSeek = false;
    this.#shouldBeRunning = false;
    this.#lastSeekFailed = false;
    this.#currentTimeInternal = 0;
  }

  public start()
  {
    if (this.#shouldBeRunning)
      return;

    if (this.#lastSeekFailed && this.allowDecoupling)
    {
      this.#shouldBeRunning = true;
      return;
    }

    this.#adjustableSourceClock.start();
    this.#shouldBeRunning = this.#adjustableSourceClock.isRunning || this.allowDecoupling;
  }

  public stop()
  {
    this.#adjustableSourceClock.stop();
    this.#shouldBeRunning = false;
  }

  public seek(position: number)
  {
    this.#lastSeekFailed = !this.#adjustableSourceClock.seek(position);

    if (!this.#lastSeekFailed)
    {
      if (this.#shouldBeRunning && !this.source.isRunning)
        this.#adjustableSourceClock.start();
    }
    else
    {
      if (!this.allowDecoupling)
        return false;

      this.#adjustableSourceClock.stop();
      this.#pendingSourceRestartAfterNegativeSeek = position < 0;
    }

    this.#currentTimeInternal = position;
    return true;
  }

  public resetSpeedAdjustments()
  {
    this.#adjustableSourceClock.resetSpeedAdjustments();
  }

  public get rate(): number
  {
    return this.#adjustableSourceClock.rate;
  }

  public set rate(value: number)
  {
    this.#adjustableSourceClock.rate = value;
  }
  // #endregion
}
