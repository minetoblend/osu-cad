import type { HitObject } from '../../../../hitObjects/HitObject';
import { Axes, Bindable, dependencyLoader, DrawablePool, LoadState, resolved } from 'osucad-framework';
import { HitObjectList } from '../../../../beatmap/HitObjectList';
import { HitObjectLifetimeEntry } from '../../../../hitObjects/drawables/HitObjectLifetimeEntry';
import { TimelineBlueprintContainer } from '../TimelineBlueprintContainer';
import { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';

export class TimelineHitObjectBlueprintContainer extends TimelineBlueprintContainer<HitObjectLifetimeEntry, TimelineHitObjectBlueprint> {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  #startTimeMap = new Map<TimelineHitObjectBlueprint, Bindable<number>>();
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

    return true;
  }

  #removeEntry(entry: HitObjectLifetimeEntry) {
    this.#entryMap.delete(entry.hitObject);
    this.removeEntry(entry);
  }

  override getDrawable(entry: HitObjectLifetimeEntry): TimelineHitObjectBlueprint {
    return this.#pool.get(it => it.entry = entry);
  }

  protected override addDrawable(entry: HitObjectLifetimeEntry, drawable: TimelineHitObjectBlueprint) {
    this.#bindStartTime(drawable);
    super.addDrawable(entry, drawable);
  }

  #bindStartTime(drawable: TimelineHitObjectBlueprint) {
    const bindable = new Bindable(0);
    bindable.bindTo(drawable.startTimeBindable);
    bindable.addOnChangeListener(() => {
      if (this.loadState >= LoadState.Ready) {
        if (drawable.parent)
          drawable.parent.changeInternalChildDepth(drawable, this.getDrawableDepth(drawable));
        else
          drawable.depth = this.getDrawableDepth(drawable);
      }
    }, { immediate: true });
    this.#startTimeMap.set(drawable, bindable);
  }

  getDrawableDepth(drawable: TimelineHitObjectBlueprint) {
    return drawable.startTimeBindable.value;
  }

  protected override removeDrawable(entry: HitObjectLifetimeEntry, drawable: TimelineHitObjectBlueprint) {
    super.removeDrawable(entry, drawable);
    this.#unbindStartTime(drawable);
  }

  #unbindStartTime(drawable: TimelineHitObjectBlueprint) {
    this.#startTimeMap.get(drawable)?.unbindAll();
    this.#startTimeMap.delete(drawable);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.hitObjects.added.removeListener(this.addHitObject, this);
    this.hitObjects.removed.removeListener(this.removeHitObject, this);
  }
}