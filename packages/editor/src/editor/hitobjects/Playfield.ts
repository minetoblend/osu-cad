import type { Constructor } from '@osucad/common';
import type { NoArgsConstructor } from 'osucad-framework';
import type { HitObject } from '../../beatmap/hitObjects/HitObject';
import type { DrawableHitObject } from './DrawableHitObject';
import { Action, Axes, Container, dependencyLoader, DrawablePool, Lazy, provide, resolved } from 'osucad-framework';
import { Beatmap } from '../../beatmap/Beatmap';
import { EditorClock } from '../EditorClock.ts';
import { HitObjectContainer } from './HitObjectContainer';
import { HitObjectEntryManager } from './HitObjectEntryManager';
import { HitObjectLifetimeEntry } from './HitObjectLifetimeEntry';
import { IPooledHitObjectProvider } from './IPooledHitObjectProvider';

@provide(IPooledHitObjectProvider)
export class Playfield extends Container implements IPooledHitObjectProvider {
  #hitObjectContainerLazy: Lazy<HitObjectContainer>;

  get hitObjectContainer() {
    return this.#hitObjectContainerLazy.value;
  }

  #entryManager = new HitObjectEntryManager();

  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.#hitObjectContainerLazy = new Lazy(() => {
      const container = this.createHitObjectContainer();

      container.hitObjectUsageBegan.addListener(hitObject => this.hitObjectUsageBegan.emit(hitObject));
      container.hitObjectUsageFinished.addListener(hitObject => this.hitObjectUsageFinished.emit(hitObject));

      return container;
    });

    this.#entryManager.onEntryAdded.addListener(([entry, parent]) => this.#onEntryAdded(entry, parent));
    this.#entryManager.onEntryRemoved.addListener(([entry, parent]) => this.#onEntryRemoved(entry, parent));
  }

  #onEntryAdded(entry: HitObjectLifetimeEntry, parent?: HitObject) {
    if (parent)
      return;

    this.hitObjectContainer.addEntry(entry);
    this.onHitObjectAdded(entry.hitObject!);
  }

  #onEntryRemoved(entry: HitObjectLifetimeEntry, parent?: HitObject) {
    if (parent)
      return;

    this.hitObjectContainer.removeEntry(entry);
    this.onHitObjectRemoved(entry.hitObject!);
  }

  protected onHitObjectAdded(hitObject: HitObject) {}

  protected onHitObjectRemoved(hitObject: HitObject) {}

  hitObjectUsageBegan = new Action<HitObject>();

  hitObjectUsageFinished = new Action<HitObject>();

  protected createHitObjectContainer(): HitObjectContainer {
    return new HitObjectContainer();
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  @dependencyLoader()
  [Symbol('load')]() {
    this.clock = this.editorClock;
    this.processCustomClock = false;
  }

  protected loadComplete() {
    super.loadComplete();

    if (!this.hitObjectContainer.parent)
      this.addInternal(this.hitObjectContainer);

    for (const h of this.beatmap.hitObjects) {
      this.addHitObject(h);
    }

    this.withScope(() => {
      this.beatmap.hitObjects.added.addListener(h => this.addHitObject(h));
      this.beatmap.hitObjects.removed.addListener(h => this.removeHitObject(h));
    });
  }

  addHitObject(hitObject: HitObject) {
    const entry = this.createLifeTimeEntry(hitObject);
    this.#entryManager.add(entry);
  }

  removeHitObject(hitObject: HitObject): boolean {
    const entry = this.#entryManager.get(hitObject);
    if (!entry)
      return false;

    this.#entryManager.remove(entry);
    return true;
  }

  protected createLifeTimeEntry(hitObject: HitObject) {
    return new HitObjectLifetimeEntry(hitObject);
  }

  #pools = new Map<NoArgsConstructor<HitObject>, DrawablePool<DrawableHitObject>>();

  protected registerPool(
    hitObjectClass: Constructor<HitObject>,
    drawableClass: NoArgsConstructor<DrawableHitObject>,
    initialSize: number,
    maximumSize?: number,
  ) {
    this.#registerPool(hitObjectClass, new DrawablePool(drawableClass, initialSize, maximumSize));
  }

  #registerPool(hitObjectClass: Constructor<HitObject>, pool: DrawablePool<DrawableHitObject>) {
    this.#pools.set(hitObjectClass, pool);
    this.addInternal(pool);
  }

  getPooledDrawableRepresentation(hitObject: HitObject, parent?: DrawableHitObject): DrawableHitObject | undefined {
    const pool = this.#prepareDrawableHitObjectPool(hitObject);

    return pool?.get((drawable) => {
      const dho = drawable as DrawableHitObject;

      if (!dho.isInitialized) {
        this.#onNewDrawableHitObject(dho);
      }

      let entry = this.#entryManager.get(hitObject);
      if (!entry) {
        entry = this.createLifeTimeEntry(hitObject);
        this.#entryManager.add(entry, parent?.hitObject);
      }

      dho.parentHitObject = parent ?? null;
      dho.apply(entry);
    });
  }

  #prepareDrawableHitObjectPool(hitObject: HitObject) {
    const lookupType = hitObject.constructor as Constructor<HitObject>;

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

  #onNewDrawableHitObject = (drawable: DrawableHitObject) => {
    drawable.onNestedDrawableCreated.addListener(this.#onNewDrawableHitObject);

    this.onNewDrawableHitObject(drawable);
    console.assert(!drawable.isInitialized);
    drawable.isInitialized = true;
  };

  protected onNewDrawableHitObject(drawable: DrawableHitObject) {

  }

  override dispose(isDisposing: boolean = true) {
    for (const hitObject of this.beatmap.hitObjects) {
      // this.removeHitObject(hitObject);
    }

    super.dispose(isDisposing);
  }
}
