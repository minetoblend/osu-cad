import type { IComparer } from 'osucad-framework';
import type { ControlPoint } from '../../../controlPoints/ControlPoint';
import { Action } from 'osucad-framework';
import { LifetimeEntry } from '../../../pooling/LifetimeEntry';

let uid = 0;

export class ControlPointLifetimeEntry<T extends ControlPoint = ControlPoint> extends LifetimeEntry {
  static readonly COMPARER: IComparer<ControlPointLifetimeEntry> = ({
    compare(a: ControlPointLifetimeEntry, b: ControlPointLifetimeEntry): number {
      const comp = a.start.time - b.start.time;

      if (comp !== 0)
        return comp;

      return a.uid - b.uid;
    },
  });

  readonly invalidated = new Action();
  readonly start: T;

  uid = uid++;

  constructor(start: T) {
    super();
    this.start = start;

    this.lifetimeEnd = Number.MAX_VALUE;
  }

  #end: T | null = null;

  get end() {
    return this.#end;
  }

  set end(value) {
    this.unbindEvents();

    this.#end = value;

    this.#bindEvents();

    this.#refreshLifetimes();
  }

  #wasBound = false;

  #bindEvents() {
    this.unbindEvents();

    this.start.timeBindable.valueChanged.addListener(this.#onTimeChanged, this);

    if (!this.end)
      return;

    this.end!.timeBindable.valueChanged.addListener(this.#onTimeChanged, this);

    this.#wasBound = true;
  }

  unbindEvents() {
    if (!this.#wasBound)
      return;

    this.start.timeBindable.valueChanged.addListener(this.#onTimeChanged, this);
    this.end!.timeBindable.valueChanged.removeListener(this.#onTimeChanged, this);

    this.#wasBound = false;
  }

  #onTimeChanged() {
    this.#refreshLifetimes();
  }

  #refreshLifetimes() {
    if (this.end === null) {
      this.lifetimeStart = this.start.time;
      this.lifetimeEnd = Number.MAX_VALUE;

      this.invalidated.emit();
      return;
    }

    this.lifetimeStart = this.start.time;
    this.lifetimeEnd = this.end.time;

    this.invalidated.emit();
  }
}
