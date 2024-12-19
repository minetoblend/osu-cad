import type { Bindable } from 'osucad-framework';
import type { HitObject } from '../../../../hitObjects/HitObject';
import { Axes, dependencyLoader, DrawablePool, resolved } from 'osucad-framework';
import { HitObjectList } from '../../../../beatmap/HitObjectList';
import { HitObjectLifetimeEntry } from '../../../../hitObjects/drawables/HitObjectLifetimeEntry';
import { TimelineBlueprintContainer } from '../TimelineBlueprintContainer';
import { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';

export class TimelineHitObjectBlueprintContainer extends TimelineBlueprintContainer<HitObjectLifetimeEntry, TimelineHitObjectBlueprint> {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  #startTimeMap = new Map<HitObject, Bindable<number>>();
  #entryMap = new Map<HitObject, HitObjectLifetimeEntry>();

  @resolved(HitObjectList)
  hitObjects!: HitObjectList;

  readonly #pool = new DrawablePool(TimelineHitObjectBlueprint, 20, 40);

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(this.#pool);

    for (const hitObject of this.hitObjects)
      this.addHitObject(hitObject);

    this.hitObjects.added.addListener(this.addHitObject, this);
    this.hitObjects.removed.addListener(this.removeHitObject, this);
  }

  addHitObject(hitObject: HitObject) {
    this.#addEntry(new HitObjectLifetimeEntry(hitObject));

    const startTimeBindable = hitObject.startTimeBindable.getBoundCopy();
    startTimeBindable.valueChanged.addListener(() => this.#onStartTimeChanged(hitObject));
    this.#startTimeMap.set(hitObject, startTimeBindable);
  }

  #addEntry(entry: HitObjectLifetimeEntry) {
    this.#entryMap.set(entry.hitObject, entry);
    this.addEntry(entry);
  }

  removeHitObject(hitObject: HitObject) {
    const entry = this.#entryMap.get(hitObject);
    if (!entry)
      return false;

    this.#removeEntry(entry);

    const startTimeBindable = this.#startTimeMap.get(hitObject);
    this.#startTimeMap.delete(hitObject);

    startTimeBindable?.unbindAll();

    return true;
  }

  #removeEntry(entry: HitObjectLifetimeEntry) {
    this.#entryMap.delete(entry.hitObject);
    this.removeEntry(entry);
  }

  #onStartTimeChanged(hitObject: HitObject) {
  }

  override getDrawable(entry: HitObjectLifetimeEntry): TimelineHitObjectBlueprint {
    return this.#pool.get(it => it.entry = entry);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.hitObjects.added.removeListener(this.addHitObject, this);
    this.hitObjects.removed.removeListener(this.removeHitObject, this);
  }
}
