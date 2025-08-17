import type { ControlPointInfo, TimingControlPoint } from "@osucad/core";
import { almostEquals, Component, lerp, resolved, type FrameTimeInfo, type IFrameBasedClock } from "@osucad/framework";
import { BindableBeatDivisor } from "./BindableBeatDivisor";

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

  @resolved(BindableBeatDivisor)
  accessor #beatDivisor!: BindableBeatDivisor

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

  seekBeats(direction: number, snapped = false, amount = 1)
  {
    const timingPoint = this.controlPointInfo.timingPointAt(this.#targetTime);

    const beatSnapLength
      = timingPoint.beatLength / this.#beatDivisor.value;

    let newPosition = this.#targetTime + direction * amount * beatSnapLength;

    if (almostEquals(newPosition, timingPoint.time, 1))
    {
      newPosition = timingPoint.time;
    }
    else if (newPosition < timingPoint.time)
    {
      const previousTimingPoint = this.controlPointInfo.timingPointAt(newPosition);

      newPosition = this.currentTime + direction * amount * (previousTimingPoint.beatLength / this.#beatDivisor.value);
    }

    if (snapped)
      this.seekSnapped(newPosition);
    else
      this.seek(newPosition);
  }

  seekSnapped(position: number)
  {
    const timingPoint = this.controlPointInfo.timingPointAt(position);

    position -= timingPoint.time;

    const beatSnapLength
      = timingPoint.beatLength / this.#beatDivisor.value;

    const closestBeat = Math.round(position / beatSnapLength);
    position = timingPoint.time + closestBeat * beatSnapLength;

    const nextTimingPoint = this.controlPointInfo.timingPoints.find(
        t => t.time > timingPoint.time,
    ) as TimingControlPoint | undefined;

    if (nextTimingPoint && position > nextTimingPoint?.time)
      position = nextTimingPoint.time;

    position = Math.floor(position);

    this.seek(position);
  }

  override update(): void
  {
    super.update();
    this.processFrame();
  }
}
