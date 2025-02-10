import type { ObjectSummary } from '@osucad/multiplayer';
import type { IControlPoint } from './IControlPoint';
import { Comparer } from '@osucad/framework';
import { SharedObject } from '@osucad/multiplayer';

let nextUid = 0;

export abstract class ControlPoint extends SharedObject implements IControlPoint {
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

    this.time = time;
  }

  abstract get controlPointName(): string;

  raiseChanged() {
  }

  readonly #time = this.property('time', 0);

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

  override initializeFromSummary(summary: ObjectSummary) {
    super.initializeFromSummary(summary);
  }
}
