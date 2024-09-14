import type { KeyDownEvent } from 'osucad-framework';
import {
  Action,
  Container,
  Key,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { HitObjectList } from '../../../beatmap/hitObjects/HitObjectList';
import { Slider } from '../../../beatmap/hitObjects/Slider';
import type { OsuHitObject } from '../../../beatmap/hitObjects/OsuHitObject';
import { SliderSelectionType } from '../../../beatmap/hitObjects/SliderSelection.ts';

export class EditorSelection extends Container implements Iterable<OsuHitObject> {
  readonly #selection = new Set<OsuHitObject>();

  get length(): number {
    return this.#selection.size;
  }

  get selectedObjects(): OsuHitObject[] {
    return Array.from(this.#selection);
  }

  isSelected(hitObject: OsuHitObject): boolean {
    return this.#selection.has(hitObject);
  }

  readonly selectionChanged = new Action<[OsuHitObject, boolean]>();

  clear() {
    const selection = [...this.#selection];

    for (const hitObject of this.#selection) {
      this.#selection.delete(hitObject);
    }

    for (const object of selection) {
      this.selectionChanged.emit([object, false]);
    }
  }

  select(hitObjects: ReadonlyArray<OsuHitObject>, add: boolean = false) {
    if (!add) {
      const removed = new Set(this.#selection);

      for (const hitObject of hitObjects) {
        removed.delete(hitObject);
      }

      for (const hitObject of removed) {
        this.deselect(hitObject);
      }
    }

    for (const hitObject of hitObjects) {
      if (this.#selection.has(hitObject)) {
        continue;
      }

      this.#selection.add(hitObject);
      this.selectionChanged.emit([hitObject, true]);
    }
  }

  deselect(hitObject: OsuHitObject) {
    if (!this.#selection.has(hitObject)) {
      return;
    }

    this.#selection.delete(hitObject);
    this.selectionChanged.emit([hitObject, false]);
  }

  setSliderSelection(slider: Slider, type: SliderSelectionType, edges?: number[]) {
    if (!this.#selection.has(slider))
      this.select([slider]);

    slider.subSelection.select(type, edges);

    this.selectionChanged.emit([slider, true]);
  }

  @resolved(HitObjectList)
  protected readonly hitObjects!: HitObjectList;

  @dependencyLoader()
  load() {
    this.hitObjects.removed.addListener((hitObject) => {
      if (hitObject.isSelected) {
        this.deselect(hitObject);
      }
    });
    this.selectionChanged.addListener(([hitObject, selected]) => {
      hitObject.isSelected = selected;
      if (!selected && hitObject instanceof Slider) {
        hitObject.subSelection.clear();
      }
    });
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.controlPressed && e.key === Key.KeyA) {
      this.select(this.hitObjects.items);
      return true;
    }

    return false;
  }

  [Symbol.iterator](): Iterator<OsuHitObject> {
    return this.#selection[Symbol.iterator]();
  }
}
