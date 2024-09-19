import { ObservableSortedList } from 'osucad-framework';

import { ControlPoint } from './ControlPoint';

export class ControlPointList<T extends ControlPoint> extends ObservableSortedList<T> {
  constructor(
    readonly controlPointAppliedRetroactive = true,
  ) {
    super(ControlPoint.COMPARER);
  }

  onAdded(item: T) {
    super.onAdded(item);

    item.changed.addListener(this.#onControlPointChanged);
  }

  onRemoved(item: T) {
    super.onRemoved(item);

    item.changed.removeListener(this.#onControlPointChanged);
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

  #onControlPointChanged = () => {
    this.sort();
  };
}
