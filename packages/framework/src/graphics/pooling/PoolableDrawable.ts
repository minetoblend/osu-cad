import type { IDrawablePool } from './IDrawablePool';
import { CompositeDrawable } from '../containers';
import { Invalidation, InvalidationSource } from '../drawables';

export abstract class PoolableDrawable extends CompositeDrawable {
  override get disposeOnDeathRemoval(): boolean {
    return this.#pool === null && super.disposeOnDeathRemoval;
  }

  #isInUse = false;

  get isInUse() {
    return this.#isInUse;
  }

  get isInPool() {
    return this.#pool !== null;
  }

  #pool: IDrawablePool | null = null;

  #waitingForPrepare = false;

  override get isPresent() {
    return this.#waitingForPrepare || super.isPresent;
  }

  protected override loadComplete() {
    super.loadComplete();

    if (!this.isInPool) {
      this.assign();
    }
  }

  return() {
    if (!this.isInUse) {
      throw new Error('Cannot return a drawable that is not in use');
    }

    this.#isInUse = false;

    this.freeAfterUse();

    this.#pool?.return(this);
    this.#waitingForPrepare = false;
  }

  protected prepareForUse() {}

  protected freeAfterUse() {}

  setPool(pool: IDrawablePool | null) {
    if (this.isInUse)
      throw new Error('This PoolableDrawable is still in use');

    if (pool !== null && this.#pool !== null)
      throw new Error('This PoolableDrawable is already in a pool');

    this.#pool = pool;
  }

  assign() {
    if (this.isInUse)
      throw new Error('This PoolableDrawable is already in use');

    this.#isInUse = true;

    this.#waitingForPrepare = true;
  }

  override update() {
    if (this.#waitingForPrepare) {
      this.prepareForUse();
      this.#waitingForPrepare = false;
    }

    super.update();
  }

  override onInvalidate(invalidation: Invalidation, source: InvalidationSource): boolean {
    if (source !== InvalidationSource.Child && invalidation & Invalidation.Parent) {
      if (this.isInUse && this.parent === null)
        this.return();
    }

    return super.onInvalidate(invalidation, source);
  }
}
