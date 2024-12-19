import type { Property } from '../crdt/Property';
import { Action, Comparer } from 'osucad-framework';
import { ObjectCrdt } from '../crdt/ObjectCrdt';

let nextUid = 0;

export abstract class ControlPoint extends ObjectCrdt {
  static readonly COMPARER = new class extends Comparer<ControlPoint> {
    compare(a: ControlPoint, b: ControlPoint) {
      const result = a.time - b.time;
      if (result !== 0)
        return result;

      return a.uid - b.uid;
    }
  }();

  uid = nextUid++;

  protected constructor(time: number) {
    super();
    this.#time = this.property('time', time);
  }

  changed = new Action<ControlPoint>();

  raiseChanged() {
  }

  readonly #time: Property<number>;

  get timeBindable() {
    return this.#time.bindable;
  }

  get time() {
    return this.#time.value;
  }

  set time(value: number) {
    this.#time.value = value;
  }

  abstract isRedundant(existing?: ControlPoint): boolean;

  abstract deepClone(): ControlPoint;

  copyFrom(other: typeof this) {
    this.time = other.time;
  }

  equals(other: ControlPoint) {
    return this.time === other.time;
  }

  override onPropertyChanged(property: Property<any>, oldValue: any, submitEvents: boolean) {
    super.onPropertyChanged(property, oldValue, submitEvents);
    this.changed.emit(this);
  }
}
