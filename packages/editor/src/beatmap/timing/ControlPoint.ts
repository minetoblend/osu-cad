import type { ControlPointGroup } from './ControlPointGroup.ts';
import { Action, BindableNumber, Comparer } from 'osucad-framework';

let nextUid = 0;

export abstract class ControlPoint {
  static readonly COMPARER = new class extends Comparer<ControlPoint> {
    compare(a: ControlPoint, b: ControlPoint) {
      const result = a.time - b.time;
      if (result !== 0)
        return result;

      if (a.group !== null && b.group !== null)
        return a.group.uid - b.group.uid;

      return a.uid - b.uid;
    }
  }();

  uid = nextUid++;

  group: ControlPointGroup | null = null;

  protected constructor() {
    this.timeBindable.valueChanged.addListener(this.raiseChanged, this);
  }

  changed = new Action<ControlPoint>();

  raiseChanged() {
    this.changed.emit(this);
  }

  readonly timeBindable = new BindableNumber();

  get time() {
    return this.timeBindable.value;
  }

  set time(value: number) {
    this.timeBindable.value = value;
  }

  abstract isRedundant(existing?: ControlPoint): boolean;

  abstract deepClone(): ControlPoint;

  copyFrom(other: typeof this) {
    this.time = other.time;
  }

  equals(other: ControlPoint) {
    return this.time === other.time;
  }
}
