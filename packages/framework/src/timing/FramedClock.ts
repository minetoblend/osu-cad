import type { FrameTimeInfo } from "./FrameTimeInfo";
import type { IClock } from "./IClock";
import { type IFrameBasedClock, isFrameBasedClock } from "./IFrameBasedClock";
import { StopwatchClock } from "./StopwatchClock";

const fps_calculation_interval = 250;

export class FramedClock implements IFrameBasedClock
{
  public source!: IClock;

  public constructor(source: IClock = new StopwatchClock(), processSource: boolean = true)
  {
    this.#processSource = processSource;
    this.changeSource(source);
  }

  #betweenFrameTimes = new Int32Array(128);

  #totalFramesProcessed = 0;

  #framesPerSecond = 0;

  public get framesPerSecond(): number
  {
    return this.#framesPerSecond;
  }

  #jitter = 0;

  protected set jitter(value: number)
  {
    this.#jitter = value;
  }

  public get jitter()
  {
    return this.#jitter;
  }

  #currentTime = 0;

  public get currentTime(): number
  {
    return this.#currentTime;
  }

  protected set currentTime(value: number)
  {
    this.#currentTime = value;
  }

  public lastFrameTime = 0;

  public get rate()
  {
    return this.source.rate;
  }

  public get sourceTime()
  {
    return this.source.currentTime;
  }

  public get elapsedFrameTime(): number
  {
    return this.currentTime - this.lastFrameTime;
  }

  public get isRunning()
  {
    return this.source.isRunning;
  }

  #processSource: boolean;

  #timeUntilNextCalculation = 0;
  #timeSinceLastCalculation = 0;
  #framesSinceLastCalculation = 0;

  public changeSource(source: IClock)
  {
    this.source = source;
    this.currentTime = this.lastFrameTime = source.currentTime;
  }

  public processFrame(): void
  {
    this.#betweenFrameTimes[this.#totalFramesProcessed % this.#betweenFrameTimes.length]
      = this.currentTime - this.lastFrameTime;
    this.#totalFramesProcessed++;

    if (this.#processSource && isFrameBasedClock(this.source))
      this.source.processFrame();

    if (this.#timeUntilNextCalculation <= 0)
    {
      this.#timeUntilNextCalculation += fps_calculation_interval;

      if (this.#framesSinceLastCalculation === 0)
      {
        this.#framesPerSecond = 0;
        this.jitter = 0;
      }
      else
      {
        this.#framesPerSecond = Math.ceil((this.#framesSinceLastCalculation * 1000.0) / this.#timeSinceLastCalculation);

        let sum = 0;
        let sumOfSquares = 0;

        for (const time of this.#betweenFrameTimes)
        {
          sum += time;
          sumOfSquares += time * time;
        }

        const avg = sum / this.#betweenFrameTimes.length;
        const variance = sumOfSquares / this.#betweenFrameTimes.length - avg * avg;
        this.jitter = Math.sqrt(variance);
      }

      this.#timeSinceLastCalculation = this.#framesSinceLastCalculation = 0;
    }

    this.#framesSinceLastCalculation++;
    this.#timeUntilNextCalculation -= this.elapsedFrameTime;
    this.#timeSinceLastCalculation += this.elapsedFrameTime;

    this.lastFrameTime = this.currentTime;
    this.currentTime = this.sourceTime;
    this.#timeInfo = {
      elapsed: this.elapsedFrameTime,
      current: this.currentTime,
    };
  }

  #timeInfo: FrameTimeInfo = {
    elapsed: 0,
    current: 0,
  };

  public get timeInfo(): FrameTimeInfo
  {
    return this.#timeInfo;
  }

  public readonly isFrameBasedClock = true;
}
