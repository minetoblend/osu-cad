import { Bindable } from './Bindable';

export class AggregateBindable<T> {
  #aggregateFunction: (a: T, b: T) => T;

  get result() {
    return this.#result;
  }

  readonly #result: Bindable<T>;

  readonly #initialValue: T;

  constructor(aggregateFunction: (a: T, b: T) => T, initialValue: T) {
    this.#aggregateFunction = aggregateFunction;
    this.#result = new Bindable(initialValue);

    this.#initialValue = this.#result.value;
  }

  #sourceMapping: WeakRefPair<T>[] = [];

  addSource(bindable: Bindable<T>) {
    if (this.#findExistingPair(bindable)) {
      return;
    }

    const boundCopy = bindable.getBoundCopy();
    this.#sourceMapping.push({
      weakReference: bindable.weakReference,
      boundCopy,
    });
    boundCopy.addOnChangeListener(this.#recalculateAggregate, { immediate: true });
  }

  removeSource(bindable: Bindable<T>) {
    const existing = this.#findExistingPair(bindable);
    if (existing) {
      existing.boundCopy.unbindAll();
      const index = this.#sourceMapping.indexOf(existing);
      this.#sourceMapping.splice(index, 1);
    }

    this.#recalculateAggregate();
  }

  #findExistingPair(bindable: Bindable<T>) {
    return this.#sourceMapping.find(pair => pair.weakReference.deref() === bindable);
  }

  #recalculateAggregate = () => {
    let calculated = this.#initialValue;
    for (let i = 0; i < this.#sourceMapping.length; i++) {
      const pair = this.#sourceMapping[i];

      if (!pair.weakReference.deref()) {
        this.#sourceMapping.splice(i, 1);
        i--;
      }
      else {
        calculated = this.#aggregateFunction(calculated, pair.boundCopy.value);
      }
    }

    this.#result.value = calculated;
  };

  removeAllSources() {
    for (const mapping of this.#sourceMapping) {
      const b = mapping.weakReference.deref();
      if (b) {
        this.removeSource(b);
      }
    }
  }
}

interface WeakRefPair<T> {
  weakReference: WeakRef<Bindable<T>>;
  boundCopy: Bindable<T>;
}
