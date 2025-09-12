import type { PoolableDrawable } from "@osucad/framework";
import { Component, DrawablePool, type NoArgsConstructor } from "@osucad/framework";

export class MultiDrawablePool<TLookup extends object, TDrawable extends PoolableDrawable> extends Component
{
  readonly #pools = new Map<abstract new (...args: any[]) => TLookup, DrawablePool<TDrawable>>();

  public registerPool(
    lookupClass: abstract new (...args: any[]) => TLookup,
    drawableClass: NoArgsConstructor<TDrawable>,
    initialSize: number,
    maximumSize?: number,
  )
  {
    this.#registerPool(lookupClass, new DrawablePool(drawableClass, initialSize, maximumSize));
  }

  #registerPool(hitObjectClass: abstract new (...args: any[]) => TLookup, pool: DrawablePool<TDrawable>)
  {
    this.#pools.set(hitObjectClass, pool);
    this.addInternal(pool);
  }

  public getPooledDrawableRepresentation(lookup: TLookup): TDrawable | undefined
  {
    const pool = this.#prepareDrawablePool(lookup);

    return pool?.get();
  }

  #prepareDrawablePool(lookup: TLookup)
  {
    const lookupType = lookup.constructor as abstract new (...args: any[]) => TLookup;

    let pool = this.#pools.get(lookupType);
    if (!pool)
    {
      for (const [t, p] of this.#pools)
      {
        if (!(lookup instanceof t))
          continue;

        this.#pools.set(lookupType, p);
        pool = p;
      }
    }

    return pool;
  }
}
