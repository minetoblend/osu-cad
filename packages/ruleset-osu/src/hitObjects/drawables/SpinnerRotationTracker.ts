import type { MouseMoveEvent, Vec2 } from "@osucad/framework";
import { Axes, Bindable, CircularContainer, Interpolation, resolved } from "@osucad/framework";
import type { DrawableSpinner } from "./DrawableSpinner";
import { PlayfieldClock } from "@osucad/core";

export class SpinnerRotationTracker extends CircularContainer
{
  override get isPresent(): boolean
  {
    return true;
  }

  readonly #drawableSpinner: DrawableSpinner;

  #mousePosition: Vec2 | null = null;
  #lastAngle: number | null = null;

  #currentRotation = 0;
  #rotationTransferred = false;

  @resolved(PlayfieldClock, true)
  private gameplayClock?: PlayfieldClock;

  constructor(drawableSpinner: DrawableSpinner)
  {
    super();

    this.#drawableSpinner = drawableSpinner;
    drawableSpinner.hitObjectApplied.addListener(this.#resetState, this);

    this.relativeSizeAxes = Axes.Both;
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean
  {
    return true;
  }

  public tracking = false;

  public readonly isSpinning = new Bindable(false);

  get isSpinnableTime(): boolean
  {
    return this.#drawableSpinner.hitObject.startTime <= this.time.current && this.#drawableSpinner.hitObject.endTime > this.time.current;
  }

  override onMouseMove(e: MouseMoveEvent): boolean
  {
    this.#mousePosition = this.parent!.toLocalSpace(e.screenSpaceMousePosition);
    return false;
  }

  override update()
  {
    super.update();

    if (this.#mousePosition)
    {
      const pos = this.#mousePosition;

      const thisAngle = -Math.atan2(pos.x - this.drawSize.x / 2, pos.y - this.drawSize.y / 2);
      let delta = this.#lastAngle === null ? 0 : thisAngle - this.#lastAngle;

      if (delta > Math.PI)
        delta -= Math.PI * 2;
      if (delta < -Math.PI)
        delta += Math.PI * 2;

      if (this.tracking)
        this.addRotation(delta);

      this.#lastAngle = thisAngle;
    }

    this.isSpinning.value = this.isSpinnableTime && Math.abs(this.#currentRotation - this.rotation) > (10 / (2 * Math.PI));
    this.rotation = Interpolation.damp(this.rotation, this.#currentRotation, 0.99, Math.abs(this.time.elapsed));
  }

  public addRotation(delta: number)
  {
    if (!this.isSpinnableTime)
      return;

    if (!this.#rotationTransferred)
    {
      this.#currentRotation = this.rotation;
      this.#rotationTransferred = true;
    }

    console.assert(Math.abs(delta) <= Math.PI);

    const rate = this.gameplayClock?.rate ?? this.clock!.rate;
    delta = (delta * Math.abs(rate));

    this.#currentRotation += delta;
    this.#drawableSpinner.result.history.reportDelta(this.time.current, delta * 180 / Math.PI);
  }

  #resetState()
  {
    this.tracking = false;
    this.isSpinning.value = false;
    this.#mousePosition = null;
    this.#lastAngle = null;
    this.#currentRotation = 0;
    this.rotation = 0;
    this.#rotationTransferred = false;
  }

  override dispose(isDisposing: boolean = true)
  {
    super.dispose(isDisposing);

    this.#drawableSpinner.hitObjectApplied.addListener(this.#resetState, this);
  }
}
