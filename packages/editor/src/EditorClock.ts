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

  public constructor(public readonly controlPointInfo: ControlPointInfo)
  {
    super();
  }

  @resolved(BindableBeatDivisor)
  accessor #beatDivisor!: BindableBeatDivisor

  public get elapsedFrameTime(): number
  {
    return this.#frameTimeInfo.elapsed;
  }

  public get framesPerSecond(): number
  {
    throw new Error("Not supporteds");
  }

  public get timeInfo(): FrameTimeInfo
  {
    return this.#frameTimeInfo;
  }

  public processFrame(): void
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

  public readonly isFrameBasedClock = true;

  public get currentTime(): number
  {
    return this.#frameTimeInfo.current;
  }

  public get rate(): number
  {
    return 1;
  }

  #isRunning = false;

  public get isRunning(): boolean
  {
    return this.#isRunning;
  }

  public get trackLength()
  {
    // TODO
    return 100_000;
  }

  public seek(position: number)
  {
    this.#targetTime = position;
  }

  public seekBy(duration: number)
  {
    this.seek(this.currentTime + duration);
  }

  public seekBeats(direction: number, snapped = false, amount = 1)
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

  public seekSnapped(position: number)
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

  public override update(): void
  {
    super.update();
    this.processFrame();
  }
}
