import { Bindable } from 'osucad-framework';
import type { HitObject } from './HitObject';

export class HitObjectProperty<T> {
  constructor(
    readonly owner: HitObject,
    readonly propertyName: string,
    value: T,
  ) {
    this.#backingValue = this.#defaultValue = value;
  }

  #backingValue?: T;

  #defaultValue?: T;

  #backingBindable?: Bindable<T>;

  get bindable(): Bindable<T> {
    if (this.#backingBindable === undefined) {
      this.#backingBindable = new Bindable<T>(this.#defaultValue!);
      this.#backingBindable.value = this.#backingValue!;
      this.#backingValue = undefined;
      this.#defaultValue = undefined;
    }

    return this.#backingBindable;
  }

  get value(): T {
    return this.#backingBindable?.value ?? this.#backingValue!;
  }

  set value(value: T) {
    if (value === this.value)
      return;

    if (this.#backingBindable !== undefined)
      this.#backingBindable.value = value;
    else
      this.#backingValue = value;

    this.owner.changed.emit({ hitObject: this.owner, propertyName: this.propertyName });
  }
}
