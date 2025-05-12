import { Axes, Bindable, CompositeDrawable, type ReadonlyDependencyContainer, resolved } from "@osucad/framework";
import { DrawableSlider } from "../hitObjects/drawables/DrawableSlider";
import type { DrawableHitObject } from "@osucad/core";
import { ArmedState } from "@osucad/core";
import { DrawableSliderTick } from "../hitObjects/drawables/DrawableSliderTick";
import { DrawableSliderTail } from "../hitObjects/drawables/DrawableSliderTail";
import { DrawableSliderRepeat } from "../hitObjects/drawables/DrawableSliderRepeat";

export abstract class FollowCircle extends CompositeDrawable
{
  @resolved(() => DrawableSlider)
  parentObject!: DrawableSlider;

  private readonly tracking = new Bindable(false);

  protected constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.tracking.bindTo(this.parentObject.tracking);
    this.tracking.bindValueChanged(tracking =>
    {
      if (this.parentObject.judged)
        return;

      this.absoluteSequence(this.lastTrackingChangeTime, () =>
      {
        if (tracking.value)
          this.onSliderPress();
        else
          this.onSliderRelease();
      });
    }, true);
  }

  get lastTrackingChangeTime()
  {
    let entry = this.parentObject.result?.trackingHistory.findLast(it => it.time < this.time.current);

    if (!isFinite(entry?.time ?? 0))
      entry = undefined;

    return entry?.time ?? this.parentObject.hitObject?.startTime ?? this.time.current;
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.parentObject.hitObjectApplied.addListener(this.#onHitObjectApplied, this);
    this.#onHitObjectApplied(this.parentObject);

    this.parentObject.applyCustomUpdateState.addListener(this.#updateStateTransforms, this);
    this.#updateStateTransforms(this.parentObject, this.parentObject.state);
  }

  #onHitObjectApplied(drawableObject: DrawableHitObject)
  {
    this.scaleTo(1).fadeOut();

    this.finishTransforms(true);

    this.tracking.triggerChange();
  }

  #updateStateTransforms(drawableObject: DrawableHitObject, state: ArmedState)
  {
    switch (state)
    {
    case ArmedState.Hit:
      if (drawableObject instanceof DrawableSliderTail)
        this.absoluteSequence(drawableObject.hitStateUpdateTime, () => this.onSliderEnd());
      if (drawableObject instanceof DrawableSliderTick || drawableObject instanceof DrawableSliderRepeat)
        this.absoluteSequence(drawableObject.hitStateUpdateTime, () => this.onSliderTick());
      break;

    case ArmedState.Miss:
      if (drawableObject instanceof DrawableSliderTail || drawableObject instanceof DrawableSliderTick || drawableObject instanceof DrawableSliderRepeat)
        this.absoluteSequence(drawableObject.hitStateUpdateTime, () => this.onSliderBreak());
      break;
    }
  }

  override dispose(isDisposing: boolean = true)
  {
    super.dispose(isDisposing);

    this.parentObject.hitObjectApplied.removeListener(this.#onHitObjectApplied, this);
    this.parentObject.applyCustomUpdateState.removeListener(this.#updateStateTransforms, this);
  }

  protected abstract onSliderPress(): void;

  protected abstract onSliderRelease(): void;

  protected abstract onSliderEnd(): void;

  protected abstract onSliderTick(): void;

  protected abstract onSliderBreak(): void;
}
