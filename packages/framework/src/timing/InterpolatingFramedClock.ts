import { Interpolation } from "../graphics/transforms/Interpolation";
import { debugAssert } from "../utils/debugAssert";
import { FramedClock } from "./FramedClock";
import type { IClock } from "./IClock";
import type { IFrameBasedClock } from "./IFrameBasedClock";
import { isFrameBasedClock } from "./IFrameBasedClock";
import type { ISourceChangeableClock } from "./ISourceChangeableClock";
import { StopwatchClock } from "./StopwatchClock";

export class InterpolatingFramedClock implements IFrameBasedClock, ISourceChangeableClock
{
  public readonly isFrameBasedClock = true as const;

  public get timeInfo()
  {
    return {
      current: this.currentTime,
      elapsed: this.elapsedFrameTime,
    };
  }

  public allowableErrorMilliseconds = 1000.0 / 60 * 2;

  public driftRecoveryHalfLife = 50;

  public get isInterpolating()
  {
    return this.#isInterpolating;
  }

  #isInterpolating = false;

  public get drift()
  {
    return this.currentTime - this.#framedSourceClock.currentTime;
  }

  public get rate()
  {
    return this.#framedSourceClock.rate;
  }

  public get isRunning()
  {
    return this.#isRunning;
  }

  #isRunning = false;

  public get elapsedFrameTime(): number
  {
    return this.#elapsedFrameTime;
  }

  #elapsedFrameTime = 0;

  public get source()
  {
    return this.#source;
  }

  #framedSourceClock!: IFrameBasedClock;

  #source!: IClock;

  public get currentTime()
  {
    return this.#currentTime;
  }

  #currentTime = 0;

  #currentTimeInternal = 0;

  readonly #realtimeClock = new FramedClock(new StopwatchClock(true));

  public constructor(source?: IFrameBasedClock)
  {

    this.changeSource(source);
    debugAssert(!!this.source);
    debugAssert(!!this.#framedSourceClock);
  }

  public changeSource(source?: IClock)
  {
    if (source != null && source === this.source)
      return;

    this.#source = source ?? new StopwatchClock(true);

    this.#framedSourceClock = isFrameBasedClock(this.#source) ? this.#source : new FramedClock(source);

    this.#isInterpolating = false;
    this.#currentTimeInternal = this.#framedSourceClock.currentTime;
  }

  public processFrame()
  {
    const lastTime = this.#currentTimeInternal;

    this.#realtimeClock.processFrame();
    this.#framedSourceClock.processFrame();

    const sourceIsRunning = this.#framedSourceClock.isRunning;

    const sourceHasElapsed = this.#framedSourceClock.elapsedFrameTime !== 0;

    try
    {
      if (!sourceIsRunning)
      {
        // While the source isn't running, we remain in the current interpolation mode unless there's a seek.
        // This is to ensure the most consistent playback possible, and avoid fractional differences when stopping/starting the source.
        if (sourceHasElapsed)
        {
          this.#isInterpolating = false;
          this.#currentTimeInternal = this.#framedSourceClock.currentTime;
        }

        return;
      }

      if (this.isInterpolating)
      {
        this.#currentTimeInternal += this.#realtimeClock.elapsedFrameTime * this.rate;

        this.#currentTimeInternal = Interpolation.dampContinuously(this.#currentTimeInternal, this.#framedSourceClock.currentTime, this.driftRecoveryHalfLife, this.#realtimeClock.elapsedFrameTime);

        const withinAllowableError = Math.abs(this.#framedSourceClock.currentTime - this.#currentTimeInternal) <= this.allowableErrorMilliseconds * this.rate;

        if (!withinAllowableError)
        {
          this.#isInterpolating = false;
          this.#currentTimeInternal = this.#framedSourceClock.currentTime;
        }
      }
      else
      {
        this.#currentTimeInternal = this.#framedSourceClock.currentTime;

        if (sourceHasElapsed)
          this.#isInterpolating = true;
      }

      const elapsedInOpposingDirection = this.#framedSourceClock.elapsedFrameTime !== 0 && Math.sign(this.#framedSourceClock.elapsedFrameTime) != Math.sign(this.rate);
      if (!elapsedInOpposingDirection)
        this.#currentTimeInternal = this.rate >= 0 ? Math.max(lastTime, this.#currentTimeInternal) : Math.min(lastTime, this.#currentTimeInternal);
    }
    finally
    {
      this.#isRunning = sourceIsRunning;
      this.#currentTime = this.#currentTimeInternal;
      this.#elapsedFrameTime = this.#currentTimeInternal - lastTime;
    }
  }

  public get framesPerSecond(): number
  {
    return 0;
  }
}
