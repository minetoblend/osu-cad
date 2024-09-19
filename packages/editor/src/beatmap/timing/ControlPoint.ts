import { Action, BindableNumber, Comparer } from 'osucad-framework';

export abstract class ControlPoint {
  static readonly COMPARER = new class extends Comparer<ControlPoint> {
    compare(a: ControlPoint, b: ControlPoint) {
      return a.time - b.time;
    }
  }();

  changed = new Action<ControlPoint>();

  raiseChanged() {
    this.changed.emit(this);
  }

  timeBindable = new BindableNumber();

  get time() {
    return this.timeBindable.value;
  }

  set time(value: number) {
    if (value === this.timeBindable.value)
      return;

    this.timeBindable.value = value;
    this.raiseChanged();
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
