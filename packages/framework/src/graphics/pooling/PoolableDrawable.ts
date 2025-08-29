import type { IDrawablePool } from "./IDrawablePool";
import { CompositeDrawable } from "../containers";
import { Invalidation, InvalidationSource } from "../drawables";

export abstract class PoolableDrawable extends CompositeDrawable
{
  public override get disposeOnDeathRemoval(): boolean
  {
    return this.#pool === null && super.disposeOnDeathRemoval;
  }

  #isInUse = false;

  public get isInUse()
  {
    return this.#isInUse;
  }

  public get isInPool()
  {
    return this.#pool !== null;
  }

  #pool: IDrawablePool | null = null;

  #waitingForPrepare = false;

  public override get isPresent()
  {
    return this.#waitingForPrepare || super.isPresent;
  }

  protected override loadComplete()
  {
    super.loadComplete();

    if (!this.isInPool)
    {
      this.assign();
    }
  }

  public return()
  {
    if (!this.isInUse)
    {
      throw new Error("Cannot return a drawable that is not in use");
    }

    this.#isInUse = false;

    this.freeAfterUse();

    this.#pool?.return(this);
    this.#waitingForPrepare = false;
  }

  protected prepareForUse()
  {}

  protected freeAfterUse()
  {}

  public setPool(pool: IDrawablePool | null)
  {
    if (this.isInUse)
      throw new Error("This PoolableDrawable is still in use");

    if (pool !== null && this.#pool !== null)
      throw new Error("This PoolableDrawable is already in a pool");

    this.#pool = pool;
  }

  public assign()
  {
    if (this.isInUse)
      throw new Error("This PoolableDrawable is already in use");

    this.#isInUse = true;

    this.#waitingForPrepare = true;
  }

  protected override update()
  {
    if (this.#waitingForPrepare)
    {
      this.prepareForUse();
      this.#waitingForPrepare = false;
    }

    super.update();
  }

  protected override onInvalidate(invalidation: Invalidation, source: InvalidationSource): boolean
  {
    if (source !== InvalidationSource.Child && invalidation & Invalidation.Parent)
    {
      if (this.isInUse && this.parent === null)
        this.return();
    }

    return super.onInvalidate(invalidation, source);
  }
}
