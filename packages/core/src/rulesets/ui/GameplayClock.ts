import type { FrameTimeInfo, IFrameBasedClock } from "@osucad/framework";

export class GameplayClock implements IFrameBasedClock
{
  #currentFrame: FrameTimeInfo = {
    current: 0,
    elapsed: 0,
  };

  #rate = 1;

  #isRunning = false;

  #offset = 0;
  #startTime = 0;

  public constructor(autoStart = false)
  {
    if (autoStart)
      this.start();
  }

  public processFrame(): void
  {
    if (!this.#isRunning)
    {
      this.#currentFrame.elapsed = 0;
      return;
    }

    const currentTime = this.#offset + (performance.now() - this.#startTime) * this.#rate;

    this.#currentFrame = {
      current: currentTime,
      elapsed: currentTime - this.currentTime,
    };
  }

  public get timeInfo(): FrameTimeInfo
  {
    return this.#currentFrame;
  }

  public get currentTime(): number
  {
    return this.#currentFrame.current;
  }

  public get elapsedFrameTime(): number
  {
    return this.#currentFrame.elapsed;
  }

  public get framesPerSecond(): number
  {
    throw new Error("Method not implemented.");
  }

  public readonly isFrameBasedClock = true;

  public get isRunning(): boolean
  {
    return this.#isRunning;
  }

  public get rate(): number
  {
    return this.#rate;
  }

  public set rate(value)
  {
    const wasRunning = this.isRunning;
    if (wasRunning)
      this.stop();

    this.#rate = value;

    if (wasRunning)
      this.start();
  }

  public start()
  {
    if (this.isRunning)
      return;

    this.#offset = this.currentTime;
    this.#startTime = performance.now();
    this.#isRunning = true;
  }

  public stop()
  {
    if (!this.#isRunning)
      return;

    this.processFrame();
    this.#isRunning = false;
  }

  public seek(position: number)
  {
    if (this.isRunning)
    {
      this.#offset = position;
      this.#startTime = performance.now();
      this.processFrame();
    }
    else
    {
      this.#currentFrame = {
        current: position,
        elapsed: position - this.currentTime,
      };
    }
  }
}
