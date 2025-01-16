import type { Bindable } from '@osucad/framework';
import type { Beatmap } from './Beatmap';
import { Action } from '@osucad/framework';
import { SharedSortedList } from '@osucad/multiplayer';
import { HitObject } from '../hitObjects/HitObject';
import { RulesetStore } from '../rulesets/RulesetStore';

export class HitObjectList<T extends HitObject = HitObject> extends SharedSortedList<T> {
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

  protected override createChildSummary(child: T): any {
    return {
      type: (child.constructor as any).__typeName__,
      data: super.createChildSummary(child),
    };
  }

  protected override createChildFromSummary(summary: any): T {
    const ctor = RulesetStore.HIT_OBJECT_CLASSES[summary.type];
    if (!ctor)
      throw new Error(`HitObject type ${summary.type} not found`);

    // eslint-disable-next-line new-cap
    const hitObject = new ctor();
    hitObject.initializeFromSummary(summary.data);

    return hitObject as T;
  }
}
