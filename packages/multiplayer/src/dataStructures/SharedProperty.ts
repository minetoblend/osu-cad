import type { ValueChangedEvent } from '@osucad/framework';
import type { ISerializer } from './ISerializer';
import type { SharedObject } from './SharedObject';
import { Bindable } from '@osucad/framework';

export class SharedProperty<T> {
  constructor(
    readonly target: SharedObject,
    readonly name: string,
    initialValue: T | Bindable<T>,
    readonly serializer?: ISerializer<T, any>,
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
    if (this.serializer)
      value = this.serializer.deserialize(value);

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
    let previousValue = evt.previousValue;
    if (this.serializer)
      previousValue = this.serializer.serialize(previousValue);

    this.target.onPropertyChanged(this, previousValue, !this.#suppressEvents);
  }

  pendingVersion?: number;

  get hasPendingChanges() {
    return this.pendingVersion !== undefined;
  }

  createSummary() {
    if (this.serializer)
      return this.serializer.serialize(this.value);

    return this.value;
  }
}
