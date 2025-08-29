import type { Drawable } from "../drawables";
import type { IAnimation } from "./IAnimation";
import { dependencyLoader } from "../../di";
import { FramedClock, type IFrameBasedClock } from "../../timing";
import { ManualClock } from "../../timing/ManualClock";
import { clamp } from "../../utils";
import { Container } from "../containers";
import { Axes } from "../drawables";
import { CustomisableSizeCompositeDrawable } from "./CustomisableSizeCompositeDrawable";

export abstract class AnimationClockComposite extends CustomisableSizeCompositeDrawable implements IAnimation
{
  readonly #startAtCurrentTime: boolean;

  #hasSeeked = false;

  readonly #manualClock = new ManualClock();

  protected constructor(startAtCurrentTime: boolean = true)
  {
    super();

    this.#startAtCurrentTime = startAtCurrentTime;
  }

  public get finishedPlaying(): boolean
  {
    return !this.loop && this.playbackPosition > this.duration;
  }

  @dependencyLoader()
  #load()
  {
    super.addInternal(
        new Container({
          relativeSizeAxes: Axes.Both,
          clock: new FramedClock(this.#manualClock),
          child: this.createContent(),
        }),
    );
  }

  public override get clock(): IFrameBasedClock
  {
    return super.clock;
  }

  public override set clock(value: IFrameBasedClock)
  {
    super.clock = value;
    this.#consumeClockTime();
  }

  protected override loadComplete()
  {
    super.loadComplete();

    const elapsed = this.#consumeClockTime();

    if (!this.#startAtCurrentTime && !this.#hasSeeked)
    {
      this.#manualClock.currentTime += elapsed;
    }
  }

  protected override addInternal<T extends Drawable>(drawable: T): undefined | T
  {
    throw new Error("Use createContent instead.");
  }

  protected abstract createContent(): Drawable;

  #lastConsumedTime = 0;

  protected override update()
  {
    super.update();

    const consumedTime = this.#consumeClockTime();
    if (this.isPlaying)
    {
      this.#manualClock.currentTime += consumedTime;
    }
  }

  public get playbackPosition()
  {
    let current = this.#manualClock.currentTime;

    if (this.loop)
      current %= this.duration;

    return clamp(current, 0, this.duration);
  }

  public set playbackPosition(value: number)
  {
    this.#hasSeeked = true;

    this.#manualClock.currentTime = value;

    if (this.isLoaded)
    {
      this.#consumeClockTime();
    }
  }

  #duration = 0;

  public get duration()
  {
    return this.#duration;
  }

  protected set duration(value: number)
  {
    this.#duration = value;
  }

  public isPlaying = true;

  public loop = false;

  public seek(time: number)
  {
    this.playbackPosition = time;
  }

  #consumeClockTime()
  {
    const elapsed = this.time.current - this.#lastConsumedTime;
    this.#lastConsumedTime = this.time.current;
    return elapsed;
  }
}
