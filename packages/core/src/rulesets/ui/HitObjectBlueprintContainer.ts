import type { NoArgsConstructor } from '@osucad/framework';
import type { HitObject } from '../../hitObjects/HitObject';
import type { Constructor } from '../../utils/Constructor';
import type { HitObjectBlueprint } from './HitObjectBlueprint';
import { Action, Axes, Bindable, Container, DrawablePool, injectionToken, LoadState, provide, resolved } from '@osucad/framework';
import { HitObjectLifetimeEntry } from '../../hitObjects/drawables/HitObjectLifetimeEntry';
import { PooledDrawableWithLifetimeContainer } from '../../pooling/PooledDrawableWithLifetimeContainer';
import { HitObjectEntryManager } from '../pooling/HitObjectEntryManager';

export interface HitObjectBlueprintProvider {
  getPooledDrawableRepresentation(hitObject: HitObject): HitObjectBlueprint | undefined;
}

// eslint-disable-next-line ts/no-redeclare
export const HitObjectBlueprintProvider = injectionToken<HitObjectBlueprintProvider>();

@provide(HitObjectBlueprintProvider)
@provide(HitObjectBlueprintContainer)
export class HitObjectBlueprintContainer<TDrawable extends HitObjectBlueprint> extends Container implements HitObjectBlueprintProvider {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.#entryManager.onEntryAdded.addListener(([entry, parent]) => this.#onEntryAdded(entry, parent));
    this.#entryManager.onEntryRemoved.addListener(([entry, parent]) => this.#onEntryRemoved(entry, parent));
  }

  get allObjects() {
    return this.#blueprintContainer.aliveEntries.values();
  }

  #onEntryAdded(entry: HitObjectLifetimeEntry, parent?: HitObject) {
    if (parent)
      return;

    this.#blueprintContainer.addEntry(entry);
  }

  #onEntryRemoved(entry: HitObjectLifetimeEntry, parent?: HitObject) {
    if (parent)
      return;

    this.#blueprintContainer.removeEntry(entry);
  }

  readonly #entryManager = new HitObjectEntryManager();

  protected getEntry(hitObject: HitObject) {
    return this.#entryManager.get(hitObject);
  }

  readonly #pools = new Map<NoArgsConstructor<HitObject>, DrawablePool<TDrawable>>();

  #blueprintContainer = new BlueprintContainer();

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

  protected override loadComplete() {
    super.loadComplete();

    this.addInternal(this.#blueprintContainer);
  }

  protected registerPool(
    hitObjectClass: Constructor<HitObject>,
    drawableClass: NoArgsConstructor<TDrawable>,
    initialSize: number,
    maximumSize?: number,
  ) {
    this.#registerPool(hitObjectClass, new DrawablePool(drawableClass, initialSize, maximumSize));
  }

  #registerPool(hitObjectClass: Constructor<HitObject>, pool: DrawablePool<TDrawable>) {
    this.#pools.set(hitObjectClass, pool);
    this.addInternal(pool);
  }

  getPooledDrawableRepresentation(hitObject: HitObject): TDrawable | undefined {
    const pool = this.#prepareHitObjectBlueprintPool(hitObject);

    return pool?.get((drawable) => {
      let entry = this.#entryManager.get(hitObject);
      if (!entry) {
        entry = this.createLifeTimeEntry(hitObject);
        this.#entryManager.add(entry);
      }

      drawable.apply(entry);
    });
  }

  #prepareHitObjectBlueprintPool(hitObject: HitObject) {
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

  protected createLifeTimeEntry(hitObject: HitObject) {
    return new HitObjectLifetimeEntry(hitObject);
  }
}

class BlueprintContainer extends PooledDrawableWithLifetimeContainer<HitObjectLifetimeEntry, HitObjectBlueprint> {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(HitObjectBlueprintProvider)
  pooledObjectProvider!: HitObjectBlueprintProvider;

  readonly hitObjectUsageBegan = new Action<HitObject>();

  readonly hitObjectUsageFinished = new Action<HitObject>();

  readonly #startTimeMap = new Map<HitObjectBlueprint, Bindable<number>>();

  override getDrawable(entry: HitObjectLifetimeEntry): HitObjectBlueprint {
    const drawable = this.pooledObjectProvider?.getPooledDrawableRepresentation(entry.hitObject);
    if (!drawable)
      throw new Error(`No drawable found for hitobject ${entry.hitObject.constructor.name}`);

    return drawable;
  }

  protected override addDrawable(entry: HitObjectLifetimeEntry, drawable: HitObjectBlueprint) {
    this.#addDrawable(drawable);
    this.hitObjectUsageBegan.emit(drawable.hitObject!);
  }

  protected override removeDrawable(entry: HitObjectLifetimeEntry, drawable: HitObjectBlueprint) {
    drawable.onKilled();

    this.#removeDrawable(drawable);
    this.hitObjectUsageFinished.emit(entry.hitObject);
  }

  #unbindStartTime(drawable: HitObjectBlueprint) {
    this.#startTimeMap.get(drawable)?.unbindAll();
    this.#startTimeMap.delete(drawable);
  }

  #addDrawable(drawable: HitObjectBlueprint) {
    this.#bindStartTime(drawable);

    drawable.depth = this.getDrawableDepth(drawable);
    this.addInternal(drawable);
  }

  getDrawableDepth(drawable: HitObjectBlueprint) {
    return drawable.startTimeBindable.value;
  }

  #removeDrawable(drawable: HitObjectBlueprint) {
    this.#unbindStartTime(drawable);

    this.removeInternal(drawable, false);
  }

  #bindStartTime(drawable: HitObjectBlueprint) {
    const bindable = new Bindable(0);
    bindable.bindTo(drawable.startTimeBindable);

    bindable.valueChanged.addListener(() => {
      if (this.loadState >= LoadState.Ready) {
        if (drawable.parent)
          drawable.parent.changeInternalChildDepth(drawable, this.getDrawableDepth(drawable));
        else
          drawable.depth = this.getDrawableDepth(drawable);
      }
    });

    this.#startTimeMap.set(drawable, bindable);
  }

  override dispose(isDisposing: boolean = true) {
    for (const entry of [...this.aliveEntries.keys()]) {
      this.removeEntry(entry);
    }

    super.dispose(isDisposing);
  }
}
