import type { Bindable } from 'osucad-framework';
import type { ControlPoint } from '../controlPoints/ControlPoint';
import type { Beatmap } from './Beatmap';
import { ObservableSortedList } from 'osucad-framework';
import { HitObject } from '../hitObjects/HitObject';

export class HitObjectList extends ObservableSortedList<HitObject> {
  applyDefaultsImmediately = true;

  constructor(readonly beatmap: Beatmap) {
    super(HitObject.COMPARER);
  }

  #idMap = new Map<string, HitObject>();

  #needsDefaultsApplied = new Set<HitObject>();

  #startTimeMap = new Map<HitObject, Bindable<number>>();

  override onAdded(item: HitObject) {
    super.onAdded(item);

    this.#idMap.set(item.id, item);

    item.needsDefaultsApplied.addListener(this.onApplyDefaultsRequested, this);

    const startTime = item.startTimeBindable.getBoundCopy();

    startTime.valueChanged.addListener(() => {
      this.sort();
    });

    this.#startTimeMap.set(item, startTime);

    this.applyDefaultsToHitObject(item);
  }

  override onRemoved(item: HitObject) {
    super.onRemoved(item);

    this.#idMap.delete(item.id);

    const startTime = this.#startTimeMap.get(item);
    if (startTime) {
      startTime.unbindAll();
      this.#startTimeMap.delete(item);
    }

    item.needsDefaultsApplied.removeListener(this.onApplyDefaultsRequested);
  }

  getById(id: string) {
    return this.#idMap.get(id);
  }

  protected applyDefaultsToAll() {
    for (const hitObject of this) {
      this.applyDefaultsToHitObject(hitObject);
    }
  }

  protected onApplyDefaultsRequested(hitObject: HitObject) {
    if (this.applyDefaultsImmediately)
      this.applyDefaultsToHitObject(hitObject);
    else
      this.#needsDefaultsApplied.add(hitObject);
  }

  invalidateAll() {
    if (this.applyDefaultsImmediately) {
      this.applyDefaultsToAll();
      return;
    }

    for (const hitObject of this)
      this.#needsDefaultsApplied.add(hitObject);
  }

  applyDefaultsWhereNeeded(visibleStartTime: number = -Number.MAX_VALUE, visibleEndTime = Number.MAX_VALUE, limit = Number.MAX_VALUE) {
    let numApplied = 0;

    // Objects on screen should always get processed immediately
    for (const h of [...this.#needsDefaultsApplied]) {
      if (h.endTime > visibleStartTime && h.startTime < visibleEndTime) {
        this.applyDefaultsToHitObject(h);
        this.#needsDefaultsApplied.delete(h);
        numApplied++;
      }
    }

    for (const h of [...this.#needsDefaultsApplied]) {
      this.applyDefaultsToHitObject(h);
      this.#needsDefaultsApplied.delete(h);
      numApplied++;

      if (numApplied > limit)
        break;
    }
  }

  protected applyDefaultsToHitObject(hitObject: HitObject) {
    hitObject.applyDefaults(this.beatmap.controlPoints, this.beatmap.difficulty);
  }

  invalidateFromControlPoint(controlPoint: ControlPoint) {
    const list = this.beatmap.controlPoints.listFor(controlPoint);

    const index = list?.indexOf(controlPoint) ?? -1;

    if (!list || index < 0) {
      this.invalidateAll();
      return;
    }

    const next = list.get(index + 1);

    const startTime = controlPoint.time;
    const endTime = next ? next.time : Number.MAX_VALUE;

    this.invalidateRange(startTime, endTime);
  }

  invalidateRange(startTime: number, endTime: number) {
    for (const h of this) {
      if (h.startTime >= endTime)
        return;

      if (h.endTime >= startTime)
        this.onApplyDefaultsRequested(h);
    }
  }
}
