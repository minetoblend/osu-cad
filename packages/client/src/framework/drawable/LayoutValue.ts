import { Drawable } from './Drawable';
import { Invalidation } from './Invalidation';

export class LayoutValue<T> {
  #value: T;
  constructor(
    value: T,
    readonly target: Drawable,
    readonly invalidation: Invalidation,
  ) {
    this.#value = value;
  }

  get value() {
    return this.#value;
  }

  set value(value: T) {
    if (this.#value === value) return;
    this.#value = value;
    this.target.invalidate(this.invalidation);
  }
}
