import { Action, Bindable, provide } from "@osucad/framework";
import { Color } from "pixi.js";
import { PoolableDrawableWithLifetime } from "../../../pooling/PoolableDrawableWithLifetime";
import { IAnimationTimeReference } from "../../../skinning/IAnimationTimeReference";
import { HitObject } from "../HitObject";
import { HitObjectLifetimeEntry } from "./HitObjectLifetimeEntry";
import { SyntheticHitObjectEntry } from "./SyntheticHitObjectEntry";

@provide(DrawableHitObject)
export abstract class DrawableHitObject<out T extends HitObject = HitObject>
  extends PoolableDrawableWithLifetime<HitObjectLifetimeEntry>
  implements IAnimationTimeReference 
{
  readonly animationStartTime = new Bindable(0);

  protected constructor(initialHitObject?: T) 
  {
    super();

    if (initialHitObject) 
    {
      this.entry = new SyntheticHitObjectEntry(initialHitObject);
    }
  }

  get hitObject(): T 
  {
    return this.entry?.hitObject as T;
  }

  readonly applyCustomUpdateState = new Action<DrawableHitObject>();

  readonly startTimeBindable = new Bindable(0);

  readonly accentColor = new Bindable(new Color("red"));

  get hitStateUpdateTime() 
  {
    return this.hitObject.endTime;
  }

  override get requiresChildrenUpdate(): boolean 
  {
    return true;
  }

  override get isPresent(): boolean 
  {
    return super.isPresent || this.isIdle;
  }

  get isIdle() 
  {
    return this.clock !== null && this.clock.currentTime >= this.lifetimeStart;
  }

  protected override onApply(entry: HitObjectLifetimeEntry) 
  {
    super.onApply(entry);

    this.startTimeBindable.bindTo(this.hitObject.startTimeBindable);

    this.onApplied();

    this.updateComboColor();
    this.applyStateTransforms();
  }

  protected override onFree(entry: HitObjectLifetimeEntry) 
  {
    super.onFree(entry);

    this.startTimeBindable.unbindFrom(this.hitObject.startTimeBindable);

    this.onFreed();

    this.#clearExistingStateTransforms();
  }

  protected onApplied() 
  {
  }

  protected onFreed() 
  {
  }

  protected applyStateTransforms() 
  {
    this.lifetimeEnd = Number.MAX_VALUE;

    this.#clearExistingStateTransforms();

    const initialTransformsTime = this.hitObject!.startTime - this.initialLifetimeOffset;

    this.animationStartTime.value = initialTransformsTime;

    this.absoluteSequence({ time: initialTransformsTime, recursive: true }, () => this.updateInitialTransforms());
    this.absoluteSequence({ time: this.hitObject.startTime, recursive: true }, () => this.updateStartTimeTransforms());
    this.absoluteSequence({ time: this.hitObject.endTime, recursive: true }, () => this.updateHitStateTransforms());

    if (this.lifetimeEnd === Number.MAX_VALUE)
      this.lifetimeEnd = Math.max(this.latestTransformEndTime, this.hitObject!.endTime);

    this.applyCustomUpdateState.emit(this);
  }

  #clearExistingStateTransforms() 
  {
    super.applyTransformsAt(-Number.MAX_VALUE, true);

    super.clearTransformsAfter(-Number.MAX_VALUE, true);
  }

  override clearTransformsAfter() 
  {
  }

  override applyTransformsAt() 
  {
  }

  protected get initialLifetimeOffset() 
  {
    return 1000;
  }

  protected updateInitialTransforms() 
  {
    this.fadeInFromZero();
  }

  protected updateStartTimeTransforms() 
  {
  }

  protected updateHitStateTransforms() 
  {
  }

  onKilled() 
  {
  }

  protected updateComboColor() 
  {
  }
}
