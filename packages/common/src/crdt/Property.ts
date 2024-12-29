import type { ValueChangedEvent } from 'osucad-framework';
import type { ObjectCrdt } from './ObjectCrdt';
import { Bindable } from 'osucad-framework';

export class Property<T> {
  constructor(
    readonly target: ObjectCrdt,
    readonly name: string,
    initialValue: T,
  ) {
    this.bindable = new Bindable(initialValue);
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
