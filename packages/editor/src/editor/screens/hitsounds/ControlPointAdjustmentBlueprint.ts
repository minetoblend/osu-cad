import type { ControlPoint } from '../../../beatmap/timing/ControlPoint';
import type { ControlPointLifetimeEntry } from './ControlPointLifetimeEntry';
import { CompositeDrawable } from 'osucad-framework';

export class ControlPointAdjustmentBlueprint<T extends ControlPoint = ControlPoint> extends CompositeDrawable {
  #entry: ControlPointLifetimeEntry<T> | null = null;

  get entry() {
    return this.#entry;
  }

  set entry(value) {
    if (value === this.#entry)
      return;

    if (this.#entry)
      this.onFree(this.#entry);

    this.#entry = value;
    if (value)
      this.onApply(value);
  }

  get controlPoint() {
    if (this.#entry === null)
      return null;
    return this.#entry.start;
  }

  get next() {
    if (this.#entry === null)
      return null;
    return this.#entry.end;
  }

  protected onApply(entry: ControlPointLifetimeEntry) {

  }

  protected onFree(entry: ControlPointLifetimeEntry) {
  }
}
