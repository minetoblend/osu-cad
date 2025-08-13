import type { ControlPointInfo } from "@osucad/core";
import { Component, lerp, type FrameTimeInfo, type IFrameBasedClock } from "@osucad/framework";

export class EditorClock extends Component implements IFrameBasedClock
{
  #frameTimeInfo: FrameTimeInfo = {
    current: 0,
    elapsed: 0,
  };

  #targetTime = 0;

  constructor(readonly controlPointInfo: ControlPointInfo)
  {
    super();
  }

  get elapsedFrameTime(): number
  {
    return this.#frameTimeInfo.elapsed;
  }

  get framesPerSecond(): number
  {
    throw new Error("Not supporteds");
  }

  get timeInfo(): FrameTimeInfo
  {
    return this.#frameTimeInfo;
  }

  processFrame(): void
  {
    if (!this.#isRunning)
    {
      const previous = this.#frameTimeInfo.current;
      const target = this.#targetTime;

      let time = lerp(target, previous, Math.exp(-.03 * this.time.elapsed));

      if (Math.abs(time - previous) < 1)
        time = target;

      this.#frameTimeInfo.current = time;
      this.#frameTimeInfo.elapsed = time - previous;
    }
    else
    {
      // TODO
    }
  }

  readonly isFrameBasedClock = true;

  get currentTime(): number
  {
    return this.#frameTimeInfo.current;
  }

  get rate(): number
  {
    return 1;
  }

  #isRunning = false;

  get isRunning(): boolean
  {
    return this.#isRunning;
  }

  get trackLength()
  {
    // TODO
    return 100_000;
  }

  seek(position: number)
  {
    this.#targetTime = position;
  }

  seekBy(duration: number)
  {
    this.seek(this.currentTime + duration);
  }

  override update(): void
  {
    super.update();
    this.processFrame();
  }
}
