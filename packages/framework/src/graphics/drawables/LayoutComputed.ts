import { type Drawable, type Invalidation, InvalidationSource } from "./Drawable";
import { LayoutMember } from "./LayoutMember";

export class LayoutComputed<T> extends LayoutMember
{
  public constructor(
    computeFn: () => T,
    invalidation: Invalidation,
    source: InvalidationSource = InvalidationSource.Default,
    condition?: (drawable: Drawable, invalidation: Invalidation) => boolean,
  )
  {
    super(invalidation, source, condition);
    this.#computeFn = computeFn;
  }

  readonly #computeFn: () => T;

  #value?: T;

  public get value()
  {
    if (!this.isValid)
    {
      this.#value = this.#computeFn();
      this.validate();
    }
    return this.#value!;
  }
}
