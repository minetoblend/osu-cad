import { BeatmapManager } from './beatmapManager.ts';
import { HitObject, HitSoundSample } from '@osucad/common';

export class SelectionManager {
  constructor(beatmapManager: BeatmapManager) {
    this.hitObjectSelected.on((h) => (h.isSelected = true));
    this.hitObjectDeselected.on((h) => (h.isSelected = false));

    beatmapManager.hitObjects.onRemoved.addListener((h) => {
      this.remove(h);
    });
  }

  readonly selectedObjects = new Set<HitObject>();
  readonly selectedHitSounds = new Set<HitSoundSample>();

  clear() {
    const objects = [...this.selectedObjects];
    this.selectedObjects.clear();
    for (const obj of objects) {
      this.hitObjectDeselected.trigger(obj);
    }
  }

  select(hitObject: HitObject) {
    this.clear();
    this.selectedObjects.add(hitObject);
    this.hitObjectSelected.trigger(hitObject);
  }

  selectAll(hitObjects: HitObject[]) {
    const newSelection = new Set(hitObjects);
    const oldSelection = new Set(this.selectedObjects);
    for (const obj of oldSelection) {
      if (!newSelection.has(obj)) {
        this.remove(obj);
      } else {
        newSelection.delete(obj);
      }
    }
    for (const obj of newSelection) {
      this.selectedObjects.add(obj);
      this.hitObjectSelected.trigger(obj);
    }
  }

  add(hitObject: HitObject) {
    if (this.selectedObjects.add(hitObject)) {
      this.hitObjectSelected.trigger(hitObject);
    }
  }

  remove(hitObject: HitObject) {
    if (this.selectedObjects.delete(hitObject)) {
      this.hitObjectDeselected.trigger(hitObject);
    }
  }

  isSelected(hitObject: HitObject) {
    return this.selectedObjects.has(hitObject);
  }

  get size() {
    return this.selectedObjects.size;
  }

  hitObjectSelected = createEventHook<HitObject>();
  hitObjectDeselected = createEventHook<HitObject>();
}
