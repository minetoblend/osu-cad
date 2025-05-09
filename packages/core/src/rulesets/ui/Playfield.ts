import type { IFrameBasedClock, NoArgsConstructor, ReadonlyDependencyContainer } from "@osucad/framework";
import { Action, Axes, CompositeDrawable, DrawablePool, Lazy, provide, resolved } from "@osucad/framework";
import type { DrawableHitObject } from "../hitObjects/drawables/DrawableHitObject";
import { HitObjectLifetimeEntry } from "../hitObjects/drawables/HitObjectLifetimeEntry";
import type { HitObject } from "../hitObjects/HitObject";
import { HitObjectContainer } from "./HitObjectContainer";
import { IPooledHitObjectProvider } from "./IPooledHitObjectProvider";
import { PlayfieldClock } from "./PlayfieldClock";
import type { HitObjectEntryManagerEvent } from "../../pooling/HitObjectEntryManager";
import { HitObjectEntryManager } from "../../pooling/HitObjectEntryManager";
import type { JudgementResult } from "../judgements/JudgementResult";

@provide(IPooledHitObjectProvider)
@provide(Playfield)
export abstract class Playfield extends CompositeDrawable implements IPooledHitObjectProvider
{
  readonly hitObjectUsageBegan = new Action<HitObject>();

  readonly hitObjectUsageFinished = new Action<HitObject>();

  readonly newResult = new Action<[DrawableHitObject, JudgementResult]>();

  readonly #hitObjectContainer = new Lazy(() =>
  {
    const container = this.createHitObjectContainer();

    container.newResult.addListener(this.#onNewResult, this);
    container.hitObjectUsageBegan.addListener(hitObject => this.hitObjectUsageBegan.emit(hitObject));
    container.hitObjectUsageFinished.addListener(hitObject => this.hitObjectUsageFinished.emit(hitObject));

    return container;
  });

  get hitObjectContainer()
  {
    return this.#hitObjectContainer.value;
  }

  readonly #entryManager =new HitObjectEntryManager();

  protected constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.#entryManager.onEntryAdded.addListener(this.#onEntryAdded, this);
    this.#entryManager.onEntryRemoved.addListener(this.#onEntryRemoved, this);
  }

  readonly hitObjectApplied = new Action<DrawableHitObject>();

  @resolved(PlayfieldClock)
  protected playfieldClock!: IFrameBasedClock;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.clock = this.playfieldClock;
    this.processCustomClock = false;
  }

  protected override loadComplete()
  {
    super.loadComplete();

    if (!this.hitObjectContainer.parent)
      this.addInternal(this.hitObjectContainer);
  }

  protected createHitObjectContainer(): HitObjectContainer
  {
    return new HitObjectContainer();
  }

  #onNewResult(hitObject: DrawableHitObject, result: JudgementResult)
  {
    this.newResult.emit(hitObject, result);
  }

  addHitObject(hitObject: HitObject)
  {
    const entry = this.createLifetimeEntry(hitObject);
    this.#entryManager.add(entry);
  }

  removeHitObject(hitObject: HitObject)
  {
    const entry = this.#entryManager.get(hitObject);
    if (entry)
    {
      this.#entryManager.remove(entry);
      return true;
    }

    return false;
  }

  #onEntryAdded({ entry, parent }: HitObjectEntryManagerEvent)
  {
    if (parent)
      return;

    this.hitObjectContainer.addEntry(entry);
    this.onHitObjectAdded(entry.hitObject);
  }

  #onEntryRemoved({ entry, parent }: HitObjectEntryManagerEvent)
  {
    if (parent)
      return;

    this.hitObjectContainer.removeEntry(entry);
    this.onHitObjectRemoved(entry.hitObject);
  }

  protected onHitObjectAdded(hitObject: HitObject)
  {
  }

  protected onHitObjectRemoved(hitObject: HitObject)
  {
  }

  protected createLifetimeEntry(hitObject: HitObject)
  {
    return new HitObjectLifetimeEntry(hitObject);
  }

  #pools = new Map<abstract new (...args: any[]) => HitObject, DrawablePool<DrawableHitObject>>();

  protected registerPool(
    hitObjectClass: abstract new (...args: any[]) => HitObject,
    drawableClass: NoArgsConstructor<DrawableHitObject>,
    initialSize: number,
    maximumSize?: number,
  )
  {
    this.#registerPool(hitObjectClass, new DrawablePool(drawableClass, initialSize, maximumSize));
  }

  #registerPool(hitObjectClass: abstract new (...args: any[]) => HitObject, pool: DrawablePool<DrawableHitObject>)
  {
    this.#pools.set(hitObjectClass, pool);
    this.addInternal(pool);
  }

  getPooledDrawableRepresentation(hitObject: HitObject, parent?: DrawableHitObject): DrawableHitObject | undefined
  {
    const pool = this.#prepareDrawableHitObjectPool(hitObject);

    return pool?.get((drawable) =>
    {
      const dho = drawable as DrawableHitObject;

      if (!dho.isInitialized)
      {
        this.#onNewDrawableHitObject(dho);
      }

      let entry = this.#entryManager.get(hitObject);
      if (!entry)
      {
        entry = this.createLifetimeEntry(hitObject);
        this.#entryManager.add(entry, parent?.hitObject);
      }

      dho.parentHitObject = parent ?? null;
      dho.apply(entry);

      this.hitObjectApplied.emit(dho);
    });
  }

  #onNewDrawableHitObject(d: DrawableHitObject)
  {
    d.onNestedDrawableCreated.addListener(this.#onNewDrawableHitObject, this);

    this.onNewDrawableHitObject(d);

    console.assert(!d.isInitialized);
    d.isInitialized = true;
  }

  protected onNewDrawableHitObject(drawableHitObject: DrawableHitObject)
  {
  }

  #prepareDrawableHitObjectPool(hitObject: HitObject)
  {
    const lookupType = hitObject.constructor as abstract new (...args: any[]) => HitObject;

    let pool = this.#pools.get(lookupType);
    if (!pool)
    {
      for (const [t, p] of this.#pools)
      {
        if (!(hitObject instanceof t))
          continue;

        this.#pools.set(lookupType, p);
        pool = p;
      }
    }

    return pool;
  }
}
