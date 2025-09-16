import type { ControlPointInfo, TimingControlPoint } from "@osucad/core";
import { FramedBeatmapClock } from "@osucad/core";
import type { IClock, ReadonlyBindable } from "@osucad/framework";
import { Action, almostEquals, Bindable, clamp, Component, EasingFunction, type FrameTimeInfo, type IFrameBasedClock, Interpolation, StopwatchClock, Track, TypedTransform } from "@osucad/framework";
import { BindableBeatDivisor } from "./BindableBeatDivisor";
import type { IBeatSyncProvider } from "./IBeatSyncProvider";

export class EditorClock extends Component implements IFrameBasedClock, IBeatSyncProvider
{
  public readonly trackChanged = new Action();

  private readonly track = new Bindable<Track | undefined>(undefined);

  public get trackLength()
  {
    return this.track.value?.length ?? 60_000;
  }

  private readonly beatDivisor: BindableBeatDivisor;

  readonly #underlyingClock: FramedBeatmapClock;

  #playbackFinished = false;

  readonly #seekingOrStopped = new Bindable(true);

  public get seekingOrStopped(): ReadonlyBindable<boolean>
  {
    return this.#seekingOrStopped;
  }

  #isSeeking = false;

  public get isSeeking()
  {
    return this.#isSeeking;
  }


  public constructor(
    public readonly controlPoints: ControlPointInfo,
    beatDivisor?: BindableBeatDivisor,
  )
  {
    super();

    this.beatDivisor = beatDivisor ?? new BindableBeatDivisor();
    this.#underlyingClock = new FramedBeatmapClock(true, new StopwatchClock(false));
    this.addInternal(this.#underlyingClock);

    this.track.bindValueChanged(e => this.trackChanged.emit());
  }

  public seekSnapped(position: number)
  {
    const timingPoint = this.controlPoints.timingPointAt(position);

    position -= timingPoint.time;

    const beatSnapLength
        = timingPoint.beatLength / this.beatDivisor.value;

    const closestBeat = Math.round(position / beatSnapLength);
    position = timingPoint.time + closestBeat * beatSnapLength;

    const nextTimingPoint = this.controlPoints.timingPoints.find(
        t => t.time > timingPoint.time,
    ) as TimingControlPoint | undefined;

    if (nextTimingPoint && position > nextTimingPoint?.time)
      position = nextTimingPoint.time;

    position = Math.floor(position);

    this.seekSmoothlyTo(position);
  }

  public seekBackward(snapped = false, amount = 1)
  {
    this.#seek(-1, snapped, amount + (this.isRunning ? 1.5 : 0));
  }

  public seekForward(snapped = false, amount = 1)
  {
    this.#seek(1, snapped, amount + (this.isRunning ? 1.5 : 0));
  }

  #seek(direction: number, snapped: boolean, amount = 1)
  {
    const current = this.currentTimeAccurate;

    if (amount <= 0)
      throw new Error("Value should be greater than zero");

    let timingPoint = this.controlPoints.timingPointAt(current);

    if (direction < 0 && timingPoint.time === current)
    // When going backwards and we're at the boundary of two timing points, we compute the seek distance with the timing point which we are seeking into
      timingPoint = this.controlPoints.timingPointAt(current - 1);

    const seekAmount = timingPoint.beatLength / this.beatDivisor.value * amount;
    let seekTime = current + seekAmount * direction;

    if (!snapped || this.controlPoints.timingPoints.length === 0)
    {
      this.seekSmoothlyTo(seekTime);
      return;
    }

    // We will be snapping to beats within timingPoint
    seekTime -= timingPoint.time;

    // Determine the index from timingPoint of the closest beat to seekTime, accounting for scrolling direction
    let closestBeat;
    if (direction > 0)
      closestBeat = Math.floor(seekTime / seekAmount);
    else
      closestBeat = Math.ceil(seekTime / seekAmount);

    seekTime = timingPoint.time + closestBeat * seekAmount;

    // limit forward seeking to only up to the next timing point's start time.
    const nextTimingPoint = this.controlPoints.timingPointAfter(timingPoint.time);
    if (nextTimingPoint && seekTime > nextTimingPoint?.time)
      seekTime = nextTimingPoint.time;

    // Due to the rounding above, we may end up on the current beat. This will effectively cause 0 seeking to happen, but we don't want this.
    // Instead, we'll go to the next beat in the direction when this is the case
    if (almostEquals(current, seekTime, 0.5))
    {
      closestBeat += direction > 0 ? 1 : -1;
      seekTime = timingPoint.time + closestBeat * seekAmount;
    }

    if (seekTime < timingPoint.time && timingPoint !== this.controlPoints.timingPoints.first)
      seekTime = timingPoint.time;

    this.seekSmoothlyTo(seekTime);
  }

  public seekBy(duration: number)
  {
    this.seek(this.currentTimeAccurate + duration);
  }

  public get elapsedFrameTime(): number
  {
    return this.#underlyingClock.elapsedFrameTime;
  }

  public get framesPerSecond(): number
  {
    throw new Error("Not supporteds");
  }

  public changeSource(source?: IClock)
  {
    const currentTime = this.currentTime;

    this.track.value = source instanceof Track ? source : undefined;
    this.#underlyingClock.changeSource(source);

    this.seek(currentTime);
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

  public readonly isFrameBasedClock: true = true as const;

  public get currentTime(): number
  {
    return this.#underlyingClock.currentTime;
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
    return this.#underlyingClock.isRunning;
  }





  public seekBeats(direction: number, snapped = false, amount = 1)
  {
    const timingPoint = this.controlPoints.timingPointAt(this.currentTimeAccurate);

    const beatSnapLength
      = timingPoint.beatLength / this.beatDivisor.value;

    let newPosition = this.currentTimeAccurate + direction * amount * beatSnapLength;

    if (almostEquals(newPosition, timingPoint.time, 1))
    {
      newPosition = timingPoint.time;
    }
    else if (newPosition < timingPoint.time)
    {
      const previousTimingPoint = this.controlPoints.timingPointAt(newPosition);

      newPosition = this.currentTime + direction * amount * (previousTimingPoint.beatLength / this.beatDivisor.value);
    }

    if (snapped)
      this.seekSnapped(newPosition);
    else
      this.seek(newPosition);
  }



  public start()
  {
    this.clearTransforms();

    this.#underlyingClock.start();
  }

  public stop()
  {
    this.#seekingOrStopped.value = true;

    this.#underlyingClock.stop();
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

    this.#underlyingClock.seek(position);
  }

  public seekSmoothlyTo(seekDestination: number)
  {
    this.#seekingOrStopped.value = true;

    if (this.isRunning)
      this.seek(seekDestination);
    else
      this.#transformSeekTo(seekDestination, 300, EasingFunction.OutExpo);
  }



  #transformSeekTo(seek: number, duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    this.addTransform(
        this.populateTransform(new TransformSeek(time => this.#underlyingClock.seek(time)), clamp(seek, 0, this.trackLength), duration, easing),
    );
  }

  public override update(): void
  {
    super.update();

    this.#updateSeekingState();
    this.#updateBeatSyncState();
  }

  //#region IBeatSyncProvider
  public readonly activeTimingPoint = new Bindable<TimingControlPoint>(null!);

  public get beatIndex()
  {
    return this.#beatIndex;
  }

  public get beatProgress()
  {
    return this.#beatProgress;
  }

  #beatIndex = 0;
  #beatProgress = 0;

  #updateBeatSyncState()
  {
    const timingPoint = this.activeTimingPoint.value = this.controlPoints.timingPointAt(this.currentTime);

    const timeSinceStart = this.currentTime - timingPoint.time;
    if (timeSinceStart < 0)
    {
      this.#beatIndex = 0;
      this.#beatProgress = 0;
      return;
    }

    this.#beatIndex = Math.floor(timeSinceStart / timingPoint.beatLength);
    this.#beatProgress = timeSinceStart - this.#beatIndex * timingPoint.beatLength;
  }
  //#endregion
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
