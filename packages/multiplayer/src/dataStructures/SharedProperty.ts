import type { ValueChangedEvent } from 'osucad-framework';
import type { SharedObject } from './SharedObject';
import { Bindable } from 'osucad-framework';

export class SharedProperty<T> {
  constructor(
    readonly target: SharedObject,
    readonly name: string,
    initialValue: T | Bindable<T>,
  ) {
    this.bindable = initialValue instanceof Bindable ? initialValue : new Bindable(initialValue);
    this.bindable.valueChanged.addListener(this.#valueChanged, this);
  }

  readonly bindable: Bindable<T>;

  get value() {
    return this.bindable.value;
  }

  set value(value) {
    this.bindable.value = value;
  }

  parse(value: any) {
    this.setValue(value, true);
  }

  setValue(value: T, suppressEvents = false) {
    if (suppressEvents) {
      const previousSuppressEvents = this.#suppressEvents;
      this.#suppressEvents = true;

      try {
        this.bindable.value = value;
      }
      finally {
        this.#suppressEvents = previousSuppressEvents;
      }
    }
    else {
      this.bindable.value = value;
    }
  }

  #suppressEvents = false;

  #valueChanged(evt: ValueChangedEvent<T>) {
    this.target.onPropertyChanged(this, evt.previousValue, !this.#suppressEvents);
  }
}
