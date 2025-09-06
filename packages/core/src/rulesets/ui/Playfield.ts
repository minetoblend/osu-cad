import type { IFrameBasedClock, NoArgsConstructor, ReadonlyDependencyContainer } from "@osucad/framework";
import { Action, Axes, CompositeDrawable, DrawablePool, FramedClock, Lazy, provideSelf, resolved } from "@osucad/framework";
import type { DrawableHitObject } from "../hitObjects/drawables/DrawableHitObject";
import { HitObjectLifetimeEntry } from "../hitObjects/drawables/HitObjectLifetimeEntry";
import type { HitObject } from "../hitObjects/HitObject";
import { HitObjectContainer } from "./HitObjectContainer";
import { IPooledHitObjectProvider } from "./IPooledHitObjectProvider";
import { PlayfieldClock } from "./PlayfieldClock";
import type { HitObjectEntryManagerEvent } from "../../pooling/HitObjectEntryManager";
import { HitObjectEntryManager } from "../../pooling/HitObjectEntryManager";
import type { JudgementResult } from "../judgements/JudgementResult";
import type { GameplayCursorContainer } from "./GameplayCursorContainer";

export interface PlayfieldOptions
{
  cursor?: boolean
  autoMode?: boolean
}

@provideSelf(IPooledHitObjectProvider)
@provideSelf()
export abstract class Playfield extends CompositeDrawable implements IPooledHitObjectProvider
{
  public readonly hitObjectUsageBegan = new Action<HitObject>();

  public readonly hitObjectUsageFinished = new Action<HitObject>();

  public readonly newResult = new Action<[DrawableHitObject, JudgementResult]>();

  readonly #hitObjectContainer = new Lazy(() =>
  {
    const container = this.createHitObjectContainer();

    container.newResult.addListener(this.#onNewResult, this);
    container.hitObjectUsageBegan.addListener(hitObject => this.hitObjectUsageBegan.emit(hitObject));
    container.hitObjectUsageFinished.addListener(hitObject => this.hitObjectUsageFinished.emit(hitObject));

    return container;
  });

  public get hitObjectContainer()
  {
    return this.#hitObjectContainer.value;
  }

  readonly #entryManager =new HitObjectEntryManager();

  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  public constructor(protected readonly options: PlayfieldOptions = {})
  {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.#entryManager.onEntryAdded.addListener(this.#onEntryAdded, this);
    this.#entryManager.onEntryRemoved.addListener(this.#onEntryRemoved, this);
  }

  public readonly hitObjectApplied = new Action<DrawableHitObject>();

  @resolved(PlayfieldClock)
  protected accessor playfieldClock!: IFrameBasedClock;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    if (this.options.cursor !== false)
      this.#cursor= this.createCursor();

    if (this.cursor !== null)
    {
      // TODO: this.cursor.hide();

      this.addInternal(this.cursor);
    }

    // TODO: this is a dumb workaround around the editor clock not giving us a valid elapsedFrameTime value
    this.clock = new FramedClock(this.playfieldClock);
    this.processCustomClock = true;
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

  public addHitObject(hitObject: HitObject)
  {
    const entry = this.createLifetimeEntry(hitObject);
    this.#entryManager.add(entry);
  }

  public removeHitObject(hitObject: HitObject)
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

  public getPooledDrawableRepresentation(hitObject: HitObject, parent?: DrawableHitObject): DrawableHitObject | undefined
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
    d.autoMode = this.options.autoMode ?? false;

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

  protected override update()
  {
    super.update();

    while (this.#judgedEntries.length > 0)
    {
      const result = this.#judgedEntries[this.#judgedEntries.length-1].result;
      console.assert(result?.rawTime != null);

      if (this.time.current >= result!.rawTime!)
        break;

      this.#revertResult(this.#judgedEntries.pop()!);
    }
  }

  public readonly revertResult = new Action<JudgementResult>();

  readonly #judgedEntries: HitObjectLifetimeEntry[] = [];

  #onNewResult(drawable: DrawableHitObject, result: JudgementResult)
  {
    console.assert(result !== null && drawable.entry?.result === result && result.rawTime !== null);
    this.#judgedEntries.push(drawable.entry!);

    this.newResult.emit(drawable, result);
  }

  #revertResult(entry: HitObjectLifetimeEntry)
  {
    const result = entry.result!;
    console.assert(result !== null);

    this.revertResult.emit(result);
    entry.onRevertResult();

    result.reset();
  }

  #cursor: GameplayCursorContainer | null = null;

  public get cursor(): GameplayCursorContainer | null
  {
    return this.#cursor;
  }

  protected createCursor(): GameplayCursorContainer | null
  {
    return null;
  }
}
