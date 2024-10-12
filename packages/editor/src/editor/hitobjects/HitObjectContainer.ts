import type { HitObject } from '../../beatmap/hitObjects/HitObject';
import type { LifetimeEntry } from '../../pooling/LifetimeEntry';
import type { DrawableHitObject } from './DrawableHitObject';
import type { HitObjectLifetimeEntry } from './HitObjectLifetimeEntry';
import { Action, Axes, Bindable, LoadState, resolved } from 'osucad-framework';
import { PooledDrawableWithLifetimeContainer } from '../../pooling/PooledDrawableWithLifetimeContainer';
import { IPooledHitObjectProvider } from './IPooledHitObjectProvider';

export class HitObjectContainer extends PooledDrawableWithLifetimeContainer<HitObjectLifetimeEntry, DrawableHitObject> {
  readonly hitObjectUsageBegan = new Action<HitObject>();

  readonly hitObjectUsageFinished = new Action<HitObject>();

  readonly #startTimeMap = new Map<DrawableHitObject, Bindable<number>>();

  readonly #nonPooledHitObjectDrawableMap = new Map<LifetimeEntry, DrawableHitObject>();

  @resolved(IPooledHitObjectProvider, true)
  private pooledObjectProvider?: IPooledHitObjectProvider;

  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  removeEntry(entry: HitObjectLifetimeEntry): boolean {
    if (!super.removeEntry(entry))
      return false;

    const drawable = this.#nonPooledHitObjectDrawableMap.get(entry);
    if (drawable) {
      this.#nonPooledHitObjectDrawableMap.delete(entry);
      this.#removeDrawable(drawable);
    }

    return true;
  }

  getDrawable(entry: HitObjectLifetimeEntry): DrawableHitObject {
    let drawable = this.#nonPooledHitObjectDrawableMap.get(entry);
    if (drawable)
      return drawable;
    drawable = this.pooledObjectProvider?.getPooledDrawableRepresentation(entry.hitObject);
    if (!drawable)
      throw new Error('No drawable found for hit object');

    return drawable;
  }

  protected addDrawable(entry: HitObjectLifetimeEntry, drawable: DrawableHitObject) {
    if (this.#nonPooledHitObjectDrawableMap.has(entry))
      return;

    this.#addDrawable(drawable);
    this.hitObjectUsageBegan.emit(drawable.hitObject!);
  }

  protected removeDrawable(entry: HitObjectLifetimeEntry, drawable: DrawableHitObject) {
    drawable.onKilled();
    if (this.#nonPooledHitObjectDrawableMap.has(entry))
      return;

    this.#removeDrawable(drawable);
    this.hitObjectUsageFinished.emit(entry.hitObject);
  }

  #unbindStartTime(drawable: DrawableHitObject) {
    const bindable = this.#startTimeMap.get(drawable)?.unbindAll();
    this.#startTimeMap.delete(drawable);
  }

  #addDrawable(drawable: DrawableHitObject) {
    this.#bindStartTime(drawable);

    drawable.depth = this.getDrawableDepth(drawable);
    this.addInternal(drawable);
  }

  getDrawableDepth(drawable: DrawableHitObject) {
    return drawable.startTimeBindable.value;
  }

  #removeDrawable(drawable: DrawableHitObject) {
    this.#unbindStartTime(drawable);
    this.removeInternal(drawable, false);
  }

  add(hitObject: DrawableHitObject) {
    if (!hitObject.entry)
      throw new Error('May not add a hit object without a lifetime entry');

    this.#nonPooledHitObjectDrawableMap.set(hitObject.entry, hitObject);
    this.#addDrawable(hitObject);
    this.addEntry(hitObject.entry);
  }

  remove(hitObject: DrawableHitObject) {
    if (!hitObject.entry)
      return false;

    return this.removeEntry(hitObject.entry);
  }

  indexOf(hitObject: DrawableHitObject) {
    return this.indexOfInternal(hitObject);
  }

  #bindStartTime(drawable: DrawableHitObject) {
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
