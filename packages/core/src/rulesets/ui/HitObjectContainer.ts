import type { Drawable } from "@osucad/framework";
import { Action, Axes, Bindable, LoadState, resolved } from "@osucad/framework";
import type { LifetimeEntry } from "@osucad/framework";
import { PooledDrawableWithLifetimeContainer } from "../../pooling/PooledDrawableWithLifetimeContainer";
import type { DrawableHitObject } from "../hitObjects/drawables/DrawableHitObject";
import type { HitObjectLifetimeEntry } from "../hitObjects/drawables/HitObjectLifetimeEntry";
import type { HitObject } from "../hitObjects/HitObject";
import { IPooledHitObjectProvider } from "./IPooledHitObjectProvider";
import type { JudgementResult } from "../judgements/JudgementResult";

function compareStartTime(a: DrawableHitObject, b: DrawableHitObject)
{
  return a.hitObject.startTime - b.hitObject.startTime;
}

export class HitObjectContainer extends PooledDrawableWithLifetimeContainer<HitObjectLifetimeEntry, DrawableHitObject>
{
  public readonly hitObjectUsageBegan = new Action<HitObject>();

  public readonly hitObjectUsageFinished = new Action<HitObject>();

  public readonly drawableHitObjectBecameAlive = new Action<DrawableHitObject>();

  public readonly newResult = new Action<[DrawableHitObject, JudgementResult]>();

  readonly #startTimeMap = new Map<DrawableHitObject, Bindable<number>>();

  readonly #nonPooledHitObjectDrawableMap = new Map<LifetimeEntry, DrawableHitObject>();

  @resolved(IPooledHitObjectProvider, true)
  accessor #pooledObjectProvider: IPooledHitObjectProvider | undefined;

  public get objects()
  {
    return (this.internalChildren as DrawableHitObject[]).toSorted(compareStartTime);
  }

  public get aliveObjects()
  {
    return [...this.aliveEntries.values()].sort(compareStartTime);
  }

  public constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  public override removeEntry(entry: HitObjectLifetimeEntry): boolean
  {
    if (!super.removeEntry(entry))
      return false;

    const drawable = this.#nonPooledHitObjectDrawableMap.get(entry);
    if (drawable)
    {
      this.#nonPooledHitObjectDrawableMap.delete(entry);
      this.#removeDrawable(drawable);
    }

    return true;
  }

  public getDrawable(entry: HitObjectLifetimeEntry): DrawableHitObject
  {
    let drawable = this.#nonPooledHitObjectDrawableMap.get(entry);
    if (drawable)
      return drawable;
    drawable = this.#pooledObjectProvider?.getPooledDrawableRepresentation(entry.hitObject);
    if (!drawable)
      throw new Error(`No drawable found for HitObject ${entry.hitObject.constructor.name}`);

    return drawable;
  }

  protected override addDrawable(entry: HitObjectLifetimeEntry, drawable: DrawableHitObject)
  {
    if (this.#nonPooledHitObjectDrawableMap.has(entry))
      return;

    this.#addDrawable(drawable);
    this.hitObjectUsageBegan.emit(entry.hitObject);
    this.drawableHitObjectBecameAlive.emit(drawable);
  }

  protected override removeDrawable(entry: HitObjectLifetimeEntry, drawable: DrawableHitObject)
  {
    drawable.onKilled();
    if (this.#nonPooledHitObjectDrawableMap.has(entry))
      return;

    this.#removeDrawable(drawable);
    this.hitObjectUsageFinished.emit(entry.hitObject);
  }

  #unbindStartTime(drawable: DrawableHitObject)
  {
    this.#startTimeMap.get(drawable)?.unbindAll();
    this.#startTimeMap.delete(drawable);
  }

  #addDrawable(drawable: DrawableHitObject)
  {
    drawable.onNewResult.addListener(this.#onNewResult, this);

    this.#bindStartTime(drawable);

    drawable.depth = this.getDrawableDepth(drawable);
    this.addInternal(drawable);
  }

  public getDrawableDepth(drawable: DrawableHitObject)
  {
    return drawable.startTimeBindable.value;
  }

  #removeDrawable(drawable: DrawableHitObject)
  {
    drawable.onNewResult.removeListener(this.#onNewResult, this);

    this.#unbindStartTime(drawable);

    this.removeInternal(drawable, false);
  }

  #onNewResult(d: DrawableHitObject, result: JudgementResult)
  {
    this.newResult.emit(d, result);
  }

  public add(hitObject: DrawableHitObject)
  {
    if (!hitObject.entry)
      throw new Error("May not add a hit object without a lifetime entry");

    this.#nonPooledHitObjectDrawableMap.set(hitObject.entry, hitObject);
    this.#addDrawable(hitObject);
    this.addEntry(hitObject.entry);
  }

  public addCustom(drawable: Drawable)
  {
    this.addInternal(drawable);
  }

  public removeCustom(drawable: Drawable, disposeImmediately: boolean = true)
  {
    this.removeInternal(drawable, disposeImmediately);
  }

  public remove(hitObject: DrawableHitObject)
  {
    if (!hitObject.entry)
      return false;

    return this.removeEntry(hitObject.entry);
  }

  public indexOf(hitObject: DrawableHitObject)
  {
    return this.indexOfInternal(hitObject);
  }

  #bindStartTime(drawable: DrawableHitObject)
  {
    const bindable = new Bindable(0);
    bindable.bindTo(drawable.startTimeBindable);

    bindable.bindValueChanged(() =>
    {
      if (this.loadState >= LoadState.Ready)
      {
        if (drawable.parent)
          this.changeInternalChildDepth(drawable, this.getDrawableDepth(drawable));
        else
          drawable.depth = this.getDrawableDepth(drawable);
      }
    }, true);

    this.#startTimeMap.set(drawable, bindable);
  }

  public override dispose()
  {
    for (const entry of [...this.aliveEntries.keys()])
      this.removeEntry(entry);

    super.dispose();
  }
}
