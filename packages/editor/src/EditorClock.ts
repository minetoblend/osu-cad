import type { ControlPointInfo, TimingControlPoint } from "@osucad/core";
import type { ReadonlyBindable, Track } from "@osucad/framework";
import { almostEquals, Bindable, clamp, Component, EasingFunction, Interpolation, resolved, TypedTransform, type FrameTimeInfo, type IFrameBasedClock } from "@osucad/framework";
import { BindableBeatDivisor } from "./BindableBeatDivisor";


export class EditorClock extends Component implements IFrameBasedClock
{
  #frameTimeInfo: FrameTimeInfo = {
    current: 0,
    elapsed: 0,
  };

  public constructor(
    public readonly controlPointInfo: ControlPointInfo,
    public readonly source: Track,
  )
  {
    super();
  }

  @resolved(BindableBeatDivisor)
  accessor #beatDivisor!: BindableBeatDivisor

  #isSeeking = false;

  public get isSeeking()
  {
    return this.#isSeeking;
  }

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
    return {
      current: this.currentTime,
      elapsed: 0, // TODO
    };
  }

  public processFrame(): void
  {

  }

  public readonly isFrameBasedClock = true;

  public get currentTime(): number
  {
    return this.source.currentTime;
  }

  public get currentTimeAccurate(): number
  {
    const [...transforms] = this.transformsIterable().filter(it => it instanceof TransformSeek);

    return transforms[transforms.length - 1]?.endValue ?? this.currentTime;
  }

  public get rate(): number
  {
    return 1;
  }

  #isRunning = false;

  public get isRunning(): boolean
  {
    return this.source.isRunning;
  }

  public get trackLength()
  {
    return this.source.length;
  }



  public seekBy(duration: number)
  {
    this.seek(this.currentTimeAccurate + duration);
  }

  public seekBeats(direction: number, snapped = false, amount = 1)
  {
    const timingPoint = this.controlPointInfo.timingPointAt(this.currentTimeAccurate);

    const beatSnapLength
      = timingPoint.beatLength / this.#beatDivisor.value;

    let newPosition = this.currentTimeAccurate + direction * amount * beatSnapLength;

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

  readonly #seekingOrStopped = new Bindable(true);

  public get seekingOrStopped(): ReadonlyBindable<boolean>
  {
    return this.#seekingOrStopped;
  }

  public start()
  {
    this.clearTransforms();

    this.source.start();
  }

  public stop()
  {
    this.#seekingOrStopped.value = true;

    this.source.stop();
  }

  #updateSeekingState()
  {
    if (this.#seekingOrStopped.value)
    {
      if (this.#isSeeking && this.transforms.length === 0)
        this.#isSeeking = false;

      if (!this.isRunning)
        return;

      this.#seekingOrStopped.value = this.#isSeeking;
    }
  }

  public seek(position: number)
  {
    this.#seekingOrStopped.value = this.#isSeeking = true;

    this.clearTransforms();

    this.source.seek(position);
  }

  public seekSmoothlyTo(seekDestination: number)
  {
    this.#seekingOrStopped.value = true;

    if (this.isRunning)
      this.seek(seekDestination);
    else
      this.#transoformSeekTo(seekDestination, 300, EasingFunction.OutExpo);
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

    this.seekSmoothlyTo(position);
  }

  #transoformSeekTo(seek: number, duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    this.addTransform(
        this.populateTransform(new TransformSeek(time => this.source.seek(time)), clamp(seek, 0, this.trackLength), duration, easing),
    );
  }

  public override update(): void
  {
    super.update();

    this.#updateSeekingState();
  }
}

class TransformSeek<T extends EditorClock> extends TypedTransform<number, T>
{
  public constructor(private readonly setter: (time: number) => void)
  {
    super();
  }

  public override get targetMember(): string
  {
    return "startTime";
  }

  protected override readIntoStartValueFrom(target: EditorClock): void
  {
    this.startValue = target.currentTime;
  }

  #valueAt(time: number)
  {
    if (time < this.startTime)
      return this.startValue;
    if (time > this.endTime)
      return this.endValue;

    return Interpolation.valueAt(time, this.startValue, this.endValue, this.startTime, this.endTime, this.easing);
  }

  protected override applyTo(target: EditorClock, time: number): void
  {
    this.setter(this.#valueAt(time));
  }

  public override clone(): TypedTransform<number, T>
  {
    return new TransformSeek(this.setter);
  }
}
