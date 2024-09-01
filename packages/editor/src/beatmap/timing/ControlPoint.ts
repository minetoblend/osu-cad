import { Action, Comparer } from 'osucad-framework';

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

  #time = 0;

  get time() {
    return this.#time;
  }

  set time(value: number) {
    if (value === this.#time)
      return;

    this.#time = value;
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
