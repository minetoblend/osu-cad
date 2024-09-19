import type { Bindable } from 'osucad-framework';
import type { Beatmap } from '../Beatmap';
import type { OsuHitObject } from './OsuHitObject';
import { ObservableSortedList } from 'osucad-framework';
import { HitObject } from './HitObject';

export class HitObjectList extends ObservableSortedList<OsuHitObject> {
  applyDefaultsImmediately = true;

  constructor(readonly beatmap: Beatmap) {
    super(HitObject.COMPARER);
  }

  #idMap = new Map<string, OsuHitObject>();

  #needsDefaultsApplied = new Set<OsuHitObject>();

  #startTimeMap = new Map<OsuHitObject, Bindable<number>>();

  onAdded(item: OsuHitObject) {
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

  onRemoved(item: OsuHitObject) {
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

  protected onApplyDefaultsRequested(hitObject: OsuHitObject) {
    if (this.applyDefaultsImmediately)
      this.applyDefaultsToHitObject(hitObject);
    else
      this.#needsDefaultsApplied.add(hitObject);
  }

  applyDefaultsWhereNeeded() {
    for (const h of this.#needsDefaultsApplied) {
      this.applyDefaultsToHitObject(h);
    }
    this.#needsDefaultsApplied.clear();
  }

  protected applyDefaultsToHitObject(hitObject: OsuHitObject) {
    hitObject.applyDefaults(this.beatmap.controlPoints, this.beatmap.difficulty);
  }
}
