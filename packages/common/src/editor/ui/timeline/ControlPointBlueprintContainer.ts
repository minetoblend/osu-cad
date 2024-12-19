import type { Bindable, Drawable } from 'osucad-framework';
import type { ControlPoint } from '../../../controlPoints/ControlPoint';
import type { ControlPointList } from '../../../controlPoints/ControlPointList';
import { Axes, dependencyLoader, resolved, SortedList } from 'osucad-framework';
import { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import { ControlPointLifetimeEntry } from './ControlPointLifetimeEntry';
import { TimelineBlueprintContainer } from './TimelineBlueprintContainer';

export abstract class ControlPointBlueprintContainer<T extends ControlPoint, TDrawable extends Drawable> extends TimelineBlueprintContainer<ControlPointLifetimeEntry<T>, TDrawable> {
  #lifetimeEntries = new SortedList<ControlPointLifetimeEntry<T>>(ControlPointLifetimeEntry.COMPARER);

  #startTimeMap = new Map<T, Bindable<number>>();

  @resolved(ControlPointInfo)
  protected controlPoints!: ControlPointInfo;

  protected abstract getControlPointList(controlPoints: ControlPointInfo): ControlPointList<T>;

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativeSizeAxes = Axes.Both;

    const controlPointList = this.getControlPointList(this.controlPoints);

    for (const c of controlPointList)
      this.addControlPoint(c);

    controlPointList.added.addListener(this.addControlPoint, this);
    controlPointList.removed.addListener(this.removeControlPoint, this);
  }

  addControlPoint(controlPoint: T) {
    this.#addEntry(controlPoint);

    const startTimeBindable = controlPoint.timeBindable.getBoundCopy();
    startTimeBindable.valueChanged.addListener(() => this.#onStartTimeChanged(controlPoint));
    this.#startTimeMap.set(controlPoint, startTimeBindable);
  }

  removeControlPoint(controlPoint: T) {
    this.#removeEntry(controlPoint);

    this.#startTimeMap.get(controlPoint)?.unbindAll();
    this.#startTimeMap.delete(controlPoint);
  }

  #addEntry(controlPoint: T) {
    const newEntry = new ControlPointLifetimeEntry(controlPoint);

    const index = this.#lifetimeEntries.add(newEntry);

    if (index < this.#lifetimeEntries.length - 1) {
      const nextEntry = this.#lifetimeEntries.get(index + 1)!;
      newEntry.end = nextEntry.start;
    }
    else {
      newEntry.end = null;
    }

    if (index > 0) {
      const previousEntry = this.#lifetimeEntries.get(index - 1)!;
      previousEntry.end = newEntry.start;
    }

    this.addEntry(newEntry);
  }

  #removeEntry(controlPoint: T) {
    const index = this.#lifetimeEntries.findIndex(entry => entry.start === controlPoint);

    if (index < 0)
      return;

    const entry = this.#lifetimeEntries.get(index)!;
    entry.unbindEvents();

    this.#lifetimeEntries.removeAt(index);
    this.removeEntry(entry);

    if (index > 0) {
      const previousEntry = this.#lifetimeEntries.get(index - 1)!;
      previousEntry.end = entry.end;
    }
  }

  #onStartTimeChanged(controlPoint: T) {
    const oldIndex = this.#lifetimeEntries.findIndex(entry => entry.start === controlPoint);

    if (oldIndex < 0)
      return;

    const entry = this.#lifetimeEntries.get(oldIndex)!;
    entry.unbindEvents();

    this.#lifetimeEntries.removeAt(oldIndex);

    if (oldIndex > 0) {
      const previousEntry = this.#lifetimeEntries.get(oldIndex - 1)!;
      previousEntry.end = entry.end;
    }

    {
      const index = this.#lifetimeEntries.add(entry);

      if (index < this.#lifetimeEntries.length - 1) {
        const nextEntry = this.#lifetimeEntries.get(index + 1)!;
        entry.end = nextEntry.start;
      }
      else {
        entry.end = null;
      }

      if (index > 0) {
        const previousEntry = this.#lifetimeEntries.get(index - 1)!;
        previousEntry.end = entry.start;
      }
    }
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    for (const entry of this.#lifetimeEntries)
      entry.unbindEvents();

    this.#lifetimeEntries.clear();
  }
}
