import type { Bindable } from 'osucad-framework';
import type { Beatmap } from './Beatmap';
import { Action } from 'osucad-framework';
import { SortedListCrdt } from '../crdt/SortedListCrdt';
import { HitObject } from '../hitObjects/HitObject';

export class HitObjectList<T extends HitObject = HitObject> extends SortedListCrdt<T> {
  constructor(readonly beatmap: Beatmap<T>) {
    super(HitObject.COMPARER);
  }

  #needsDefaultsApplied = new Set<HitObject>();

  #startTimeMap = new Map<HitObject, Bindable<number>>();

  override onAdded(item: T) {
    super.onAdded(item);

    item.needsDefaultsApplied.addListener(this.onApplyDefaultsRequested, this);

    const startTime = item.startTimeBindable.getBoundCopy();

    startTime.valueChanged.addListener(() => {
      this.sort();
    });

    this.#startTimeMap.set(item, startTime);

    this.applyDefaultsToHitObject(item);
  }

  readonly applyDefaultsRequested = new Action<HitObject>();

  protected onApplyDefaultsRequested(hitObject: HitObject) {
    this.applyDefaultsRequested.emit(hitObject);
  }

  override onRemoved(item: T) {
    super.onRemoved(item);

    const startTime = this.#startTimeMap.get(item);
    if (startTime) {
      startTime.unbindAll();
      this.#startTimeMap.delete(item);
    }

    item.needsDefaultsApplied.removeListener(this.onApplyDefaultsRequested);
  }

  protected applyDefaultsToAll() {
    for (const hitObject of this) {
      this.applyDefaultsToHitObject(hitObject);
    }
  }

  protected applyDefaultsToHitObject(hitObject: HitObject) {
    hitObject.applyDefaults(this.beatmap.controlPoints, this.beatmap.difficulty);
  }
}
