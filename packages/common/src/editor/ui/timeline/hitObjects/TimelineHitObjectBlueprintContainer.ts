import type { Drawable, DrawableOptions, List } from 'osucad-framework';
import type { HitObject } from '../../../../hitObjects/HitObject';
import { Axes, Bindable, dependencyLoader, DrawablePool, LoadState, resolved } from 'osucad-framework';
import { IBeatmap } from '../../../../beatmap/IBeatmap';
import { HitObjectLifetimeEntry } from '../../../../hitObjects/drawables/HitObjectLifetimeEntry';
import { zipWithNext } from '../../../../utils/arrayUtils';
import { TimelineBlueprintContainer } from '../TimelineBlueprintContainer';
import { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';

export interface TimelineHitObjectBlueprintContainerOptions extends DrawableOptions {
  readonly?: boolean;
}

class TimelineHitObjectLifetimeEntry extends HitObjectLifetimeEntry {
  constructor(hitObject: HitObject) {
    super(hitObject);
  }

  override get initialLifetimeOffset(): number {
    return 2000;
  }

  protected override setInitialLifetime() {
    super.setInitialLifetime();

    this.lifetimeEnd = this.hitObject.endTime + 2000;
  }
}

export class TimelineHitObjectBlueprintContainer extends TimelineBlueprintContainer<HitObjectLifetimeEntry, TimelineHitObjectBlueprint> {
  constructor(options: TimelineHitObjectBlueprintContainerOptions = {}) {
    super();

    this.with({
      relativeSizeAxes: Axes.Both,
      ...options,
    });
  }

  readonly = false;

  #startTimeMap = new Map<TimelineHitObjectBlueprint, Bindable<number>>();
  #entryMap = new Map<HitObject, HitObjectLifetimeEntry>();

  @resolved(IBeatmap)
  beatmap!: IBeatmap;

  readonly #pool = new DrawablePool(TimelineHitObjectBlueprint, 20, 40);

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(this.#pool);

    for (const hitObject of this.beatmap.hitObjects)
      this.addHitObject(hitObject);

    this.beatmap.hitObjects.added.addListener(this.addHitObject, this);
    this.beatmap.hitObjects.removed.addListener(this.removeHitObject, this);
  }

  addHitObject(hitObject: HitObject) {
    if (hitObject.transient)
      return;
    this.#addEntry(new TimelineHitObjectLifetimeEntry(hitObject));
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
    return this.#pool.get((it) => {
      it.entry = entry;
      it.readonly = this.readonly;
    });
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

    this.beatmap.hitObjects.added.removeListener(this.addHitObject, this);
    this.beatmap.hitObjects.removed.removeListener(this.removeHitObject, this);
  }

  override buildNonPositionalInputQueue(queue: List<Drawable>, allowBlocking?: boolean): boolean {
    if (this.readonly)
      return false;

    return super.buildNonPositionalInputQueue(queue, allowBlocking);
  }

  override updateAfterChildren() {
    super.updateAfterChildren();

    let stackHeight = 0;

    for (const [current, last] of zipWithNext(this.blueprintContainer.content.aliveInternalChildren as TimelineHitObjectBlueprint[])) {
      if (current.hitObject!.startTime < last.hitObject!.endTime)
        stackHeight++;
      else
        stackHeight = 0;

      current.y = -stackHeight * 8;
    }
  }
}
