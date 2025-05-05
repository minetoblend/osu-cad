import { Action, Axes, CompositeDrawable, DrawablePool, IFrameBasedClock, Lazy, NoArgsConstructor, provide, ReadonlyDependencyContainer, resolved } from "@osucad/framework";
import { DrawableHitObject } from "../hitObjects/drawables/DrawableHitObject";
import { HitObjectLifetimeEntry } from "../hitObjects/drawables/HitObjectLifetimeEntry";
import { HitObject } from "../hitObjects/HitObject";
import { HitObjectContainer } from "./HitObjectContainer";
import { IPooledHitObjectProvider } from "./IPooledHitObjectProvider";
import { PlayfieldClock } from "./PlayfieldClock";

@provide(IPooledHitObjectProvider)
@provide(Playfield)
export abstract class Playfield extends CompositeDrawable implements IPooledHitObjectProvider {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  readonly hitObjectUsageBegan = new Action<HitObject>();

  readonly hitObjectUsageFinished = new Action<HitObject>();

  readonly #hitObjectContainer = new Lazy(() => {
    const container = this.createHitObjectContainer()

    container.hitObjectUsageBegan.addListener(hitObject => this.hitObjectUsageBegan.emit(hitObject));
    container.hitObjectUsageFinished.addListener(hitObject => this.hitObjectUsageFinished.emit(hitObject));

    return container
  })

  get hitObjectContainer() {
    return this.#hitObjectContainer.value;
  }

  @resolved(PlayfieldClock)
  protected playfieldClock!: IFrameBasedClock

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.clock = this.playfieldClock;
    this.processCustomClock = false;
  }

  protected override loadComplete() {
    super.loadComplete();

    if (!this.hitObjectContainer.parent)
      this.addInternal(this.hitObjectContainer);
  }

  protected createHitObjectContainer(): HitObjectContainer {
    return new HitObjectContainer();
  }

  readonly #lifetimeEntries = new Map<HitObject, HitObjectLifetimeEntry>()

  addHitObject(hitObject: HitObject) {
    const entry = this.createLifetimeEntry(hitObject);
    this.#lifetimeEntries.set(hitObject, entry)
    this.hitObjectContainer.addEntry(entry)
    this.onHitObjectAdded(hitObject)
  }

  removeHitObject(hitObject: HitObject) {
    const entry = this.#lifetimeEntries.get(hitObject)
    if (!entry)
      return

    this.hitObjectContainer.removeEntry(entry)
    this.onHitObjectRemoved(hitObject)
  }

  protected createLifetimeEntry(hitObject: HitObject) {
    return new HitObjectLifetimeEntry(hitObject)
  }

  #pools = new Map<abstract new (...args: any[]) => HitObject, DrawablePool<DrawableHitObject>>();

  protected registerPool(
      hitObjectClass: abstract new (...args: any[]) => HitObject,
      drawableClass: NoArgsConstructor<DrawableHitObject>,
      initialSize: number,
      maximumSize?: number,
  ) {
    this.#registerPool(hitObjectClass, new DrawablePool(drawableClass, initialSize, maximumSize));
  }

  #registerPool(hitObjectClass: abstract new (...args: any[]) => HitObject, pool: DrawablePool<DrawableHitObject>) {
    this.#pools.set(hitObjectClass, pool);
    this.addInternal(pool);
  }

  getPooledDrawableRepresentation(hitObject: HitObject): DrawableHitObject | undefined {
    const pool = this.#prepareDrawableHitObjectPool(hitObject);

    return pool?.get((drawable) => {
      const dho = drawable as DrawableHitObject;


      let entry = this.#lifetimeEntries.get(hitObject)
      if (!entry) {
        entry = this.createLifetimeEntry(hitObject);
      }

      dho.apply(entry);
    });
  }

  #prepareDrawableHitObjectPool(hitObject: HitObject) {
    const lookupType = hitObject.constructor as abstract new (...args: any[]) => HitObject;

    let pool = this.#pools.get(lookupType);
    if (!pool) {
      for (const [t, p] of this.#pools) {
        if (!(hitObject instanceof t))
          continue;

        this.#pools.set(lookupType, p);
        pool = p;
      }
    }

    return pool;
  }

  protected onHitObjectAdded(hitObject: HitObject) {}

  protected onHitObjectRemoved(hitObject: HitObject) {}
}