import { ObservableSortedList } from 'osucad-framework';

import { ControlPoint } from './ControlPoint';

export class ControlPointList<T extends ControlPoint> extends ObservableSortedList<T> {
  constructor(
    readonly controlPointAppliedRetroactive = true,
  ) {
    super(ControlPoint.COMPARER);
  }

  override onAdded(item: T) {
    super.onAdded(item);

    item.timeBindable.valueChanged.addListener(this.#startTimeChanged, this);
  }

  override onRemoved(item: T) {
    super.onRemoved(item);

    item.timeBindable.valueChanged.removeListener(this.#startTimeChanged, this);
  }

  controlPointAt(time: number): T | undefined {
    let index = this.binarySearch({ time } as unknown as T);

    if (index >= 0)
      return this.get(index);

    index = ~index;

    if (index > 0 && this.controlPointAppliedRetroactive)
      index--;

    return this.get(index);
  }

  #startTimeChanged() {
    this.sort();
  };
}
