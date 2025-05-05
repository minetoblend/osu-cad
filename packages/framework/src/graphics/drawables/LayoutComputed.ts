import { type Drawable, type Invalidation, InvalidationSource } from "./Drawable";
import { LayoutMember } from "./LayoutMember";

export class LayoutComputed<T> extends LayoutMember 
{
  constructor(
    computeFn: () => T,
    invalidation: Invalidation,
    source: InvalidationSource = InvalidationSource.Default,
    condition?: (drawable: Drawable, invalidation: Invalidation) => boolean,
  ) 
  {
    super(invalidation, source, condition);
    this.#computeFn = computeFn;
  }

  #computeFn: () => T;

  #value?: T;

  get value() 
  {
    if (!this.isValid) 
    {
      this.#value = this.#computeFn();
      this.validate();
    }
    return this.#value!;
  }
}
