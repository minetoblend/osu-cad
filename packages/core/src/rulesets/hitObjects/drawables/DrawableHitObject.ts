import { Action, Bindable, provide, resolved } from "@osucad/framework";
import { Color } from "pixi.js";
import { PoolableDrawableWithLifetime } from "../../../pooling/PoolableDrawableWithLifetime";
import type { IAnimationTimeReference } from "../../../skinning/IAnimationTimeReference";
import type { HitObject } from "../HitObject";
import { ArmedState } from "./ArmedState";
import type { HitObjectLifetimeEntry } from "./HitObjectLifetimeEntry";
import { SyntheticHitObjectEntry } from "./SyntheticHitObjectEntry";
import { ISkinSource } from "../../../skinning/ISkinSource";
import { IPooledHitObjectProvider } from "../../ui/IPooledHitObjectProvider";

@provide(DrawableHitObject)
export abstract class DrawableHitObject<out T extends HitObject = HitObject>
  extends PoolableDrawableWithLifetime<HitObjectLifetimeEntry>
  implements IAnimationTimeReference
{
  readonly defaultsApplied = new Action<DrawableHitObject>();

  readonly animationStartTime = new Bindable(0);

  readonly hitObjectApplied = new Action<DrawableHitObject>();

  readonly #state = new Bindable(ArmedState.Idle);

  parentHitObject: DrawableHitObject | null = null;

  get state()
  {
    return this.#state.value;
  }

  set state(value)
  {
    this.updateState(value);
  }

  protected constructor(initialHitObject?: T)
  {
    super();

    if (initialHitObject)
    {
      this.entry = new SyntheticHitObjectEntry(initialHitObject);
    }
  }

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  protected override loadComplete()
  {
    super.loadComplete();

    this.skin.sourceChanged.addListener(this.skinChanged, this);

  }

  get hitObject(): T
  {
    return this.entry?.hitObject as T;
  }

  readonly applyCustomUpdateState = new Action<[DrawableHitObject, ArmedState]>();

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

  @resolved(IPooledHitObjectProvider, true)
  private pooledObjectProvider?: IPooledHitObjectProvider;

  readonly onNestedDrawableCreated = new Action<DrawableHitObject>();

  #nestedHitObjects: DrawableHitObject[] = [];

  protected override onApply(entry: HitObjectLifetimeEntry)
  {
    super.onApply(entry);

    if (entry instanceof SyntheticHitObjectEntry)
      this.lifetimeStart = entry.lifetimeStart - this.initialLifetimeOffset;

    for (const h of this.hitObject.nestedHitObjects)
    {
      const pooledDrawableNested = this.pooledObjectProvider?.getPooledDrawableRepresentation(h, this);

      const drawableNested = pooledDrawableNested ?? this.createNestedHitObject(h);

      if (!drawableNested)
        throw new Error(`createNestedHitObject returned null for ${h.constructor.name}.`);

      if (pooledDrawableNested === null)
        this.onNestedDrawableCreated.emit(drawableNested);

      drawableNested.applyCustomUpdateState.addListener(this.#onApplyCustomUpdateState, this);

      drawableNested.parentHitObject = this;

      this.#nestedHitObjects.push(drawableNested);

      if (drawableNested.entry instanceof SyntheticHitObjectEntry)
        entry.nestedEntries.add(drawableNested.entry);

      this.addNestedHitObject(drawableNested);
    }

    this.startTimeBindable.bindTo(this.hitObject.startTimeBindable);

    this.hitObject.defaultsApplied.addListener(this.#onDefaultsApplied);

    this.onApplied();
    this.hitObjectApplied.emit(this);

    this.updateState(ArmedState.Idle, true);
    this.updateComboColor();
  }

  protected override onFree(entry: HitObjectLifetimeEntry)
  {
    super.onFree(entry);

    this.startTimeBindable.unbindFrom(this.hitObject.startTimeBindable);

    for (const obj of this.#nestedHitObjects)
      obj.applyCustomUpdateState.removeListener(this.#onApplyCustomUpdateState, this);

    this.#nestedHitObjects = [];
    for (const nestedEntry of [...entry.nestedEntries])
    {
      if (nestedEntry instanceof SyntheticHitObjectEntry)
      {
        entry.nestedEntries.delete(nestedEntry);
      }
    }
    this.clearNestedHitObjects();
    this.hitObject.defaultsApplied.removeListener(this.#onDefaultsApplied, this);

    this.onFreed();

    this.parentHitObject = null;

    this.#clearExistingStateTransforms();
  }

  protected onApplied()
  {
  }

  protected onFreed()
  {
  }

  #onDefaultsApplied(hitObject: HitObject)
  {
    console.assert(this.entry !== null);
    this.apply(this.entry!);

    this.defaultsApplied.emit(this);
  }

  protected createNestedHitObject(hitObject: HitObject): DrawableHitObject | null
  {
    return null;
  }

  protected addNestedHitObject(hitObject: DrawableHitObject)
  {
  }

  protected clearNestedHitObjects()
  {
  }

  #onApplyCustomUpdateState(drawableHitObject: DrawableHitObject, state: ArmedState)
  {
    this.applyCustomUpdateState.emit(drawableHitObject, state);
  }

  protected updateState(state: ArmedState, force = false)
  {
    if (state === this.state && !force)
      return;

    this.#state.value = state;

    this.lifetimeEnd = Number.MAX_VALUE;

    this.#clearExistingStateTransforms();

    const initialTransformsTime = this.hitObject!.startTime - this.initialLifetimeOffset;

    this.animationStartTime.value = initialTransformsTime;

    this.absoluteSequence({ time: initialTransformsTime, recursive: true }, () => this.updateInitialTransforms());
    this.absoluteSequence({ time: this.hitObject.startTime, recursive: true }, () => this.updateStartTimeTransforms());
    this.absoluteSequence({
      time: this.hitObject.endTime,
      recursive: true,
    }, () => this.updateHitStateTransforms(state));

    if (this.lifetimeEnd === Number.MAX_VALUE)
      this.lifetimeEnd = Math.max(this.latestTransformEndTime, this.hitObject!.endTime);

    this.applyCustomUpdateState.emit(this, state);
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

  protected updateHitStateTransforms(state: ArmedState)
  {
  }

  onKilled()
  {
  }

  protected updateComboColor()
  {
  }

  protected skinChanged()
  {
    this.updateComboColor();
  }

  override dispose(isDisposing?: boolean)
  {
    super.dispose(isDisposing);

    this.skin.sourceChanged.removeListener(this.skinChanged, this);
  }
}
