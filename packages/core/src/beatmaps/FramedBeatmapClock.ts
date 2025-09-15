import type { FrameTimeInfo, IAdjustableClock, IClock, IFrameBasedClock, ISourceChangeableClock } from "@osucad/framework";
import { Component, DecouplingFramedClock, InterpolatingFramedClock } from "@osucad/framework";

export class FramedBeatmapClock extends Component implements IFrameBasedClock, IAdjustableClock, ISourceChangeableClock
{
  public readonly isFrameBasedClock = true;

  public get timeInfo(): FrameTimeInfo
  {
    return {
      current: this.currentTime,
      elapsed: this.elapsedFrameTime,
    };
  }

  public constructor(
    requireDecoupling: boolean,
    source?: IClock,
  )
  {
    super();

    this.#decoupledTrack = new DecouplingFramedClock(source);
    this.#decoupledTrack.allowDecoupling = requireDecoupling;

    this.#interpolatedTrack = new InterpolatingFramedClock(this.#decoupledTrack);
    this.#interpolatedTrack.driftRecoveryHalfLife = 80;

    this.#finalClockSource = this.#interpolatedTrack;
  }

  readonly #decoupledTrack: DecouplingFramedClock;
  readonly #interpolatedTrack: InterpolatingFramedClock;
  readonly #finalClockSource: IFrameBasedClock;

  public get isRewinding()
  {
    return this.#isRewinding;
  }

  #isRewinding = false;

  protected override update()
  {
    super.update();

    this.#finalClockSource.processFrame();

    if (this.clock.elapsedFrameTime !== 0)
      this.#isRewinding = this.clock.elapsedFrameTime < 0;
  }

  // #region IAdjustableClock / ISourceChangeableClock
  public changeSource(source?: IClock)
  {
    this.#decoupledTrack.changeSource(source);
  }

  public get source()
  {
    return this.#decoupledTrack.source;
  }

  public reset()
  {
    this.#decoupledTrack.reset();
    this.#finalClockSource.processFrame();
  }

  public start()
  {
    this.#decoupledTrack.start();
    this.#finalClockSource.processFrame();
  }

  public stop()
  {
    this.#decoupledTrack.stop();
    this.#finalClockSource.processFrame();
  }

  public seek(position: number): boolean
  {
    const success = this.#decoupledTrack.seek(position);
    this.#finalClockSource.processFrame();


    return success;
  }

  public resetSpeedAdjustments()
  {
    this.#decoupledTrack.resetSpeedAdjustments();
  }

  public get rate()
  {
    return this.#decoupledTrack.rate;
  }

  public set rate(value: number)
  {
    this.#decoupledTrack.rate = value;
  }

  // #endregion

  // #region IFrameBasedClock
  public get currentTime(): number
  {
    return this.#finalClockSource.currentTime;
  }

  public get isRunning(): boolean
  {
    return this.#finalClockSource.isRunning;
  }

  public processFrame()
  {
  }

  public get elapsedFrameTime(): number
  {
    return this.#finalClockSource.elapsedFrameTime;
  }

  public get framesPerSecond(): number
  {
    return this.#finalClockSource.framesPerSecond;
  }

  // #endregion
}
