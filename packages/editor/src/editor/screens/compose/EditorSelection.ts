import type { KeyDownEvent } from 'osucad-framework';
import {
  Action,
  Container,
  Key,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import type { HitObject } from '@osucad/common';
import { HitObjectManager, Slider } from '@osucad/common';

export class EditorSelection extends Container {
  readonly #selection = new Set<HitObject>();

  get length(): number {
    return this.#selection.size;
  }

  get selectedObjects(): HitObject[] {
    return Array.from(this.#selection);
  }

  isSelected(hitObject: HitObject): boolean {
    return this.#selection.has(hitObject);
  }

  readonly selectionChanged = new Action<[HitObject, boolean]>();

  clear() {
    const selection = [...this.#selection];

    for (const hitObject of this.#selection) {
      this.#selection.delete(hitObject);
    }

    for (const object of selection) {
      this.selectionChanged.emit([object, false]);
    }
  }

  select(hitObjects: HitObject[], add: boolean = false) {
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

  deselect(hitObject: HitObject) {
    if (!this.#selection.has(hitObject)) {
      return;
    }

    this.#selection.delete(hitObject);
    this.selectionChanged.emit([hitObject, false]);
  }

  setSelectedEdges(slider: Slider, edges: number[]) {
    if (!this.#selection.has(slider)) {
      this.select([slider]);
    }

    slider.selectedEdges = edges;
    this.selectionChanged.emit([slider, true]);
  }

  @resolved(HitObjectManager)
  protected readonly hitObjects!: HitObjectManager;

  @dependencyLoader()
  load() {
    this.hitObjects.onRemoved.addListener((hitObject) => {
      if (this.#selection.has(hitObject)) {
        this.deselect(hitObject);
      }
    });
    this.selectionChanged.addListener(([hitObject, selected]) => {
      hitObject.isSelected = selected;
      if (!selected && hitObject instanceof Slider) {
        hitObject.selectedEdges = [];
      }
    });
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.controlPressed && e.key === Key.KeyA) {
      this.select(this.hitObjects.hitObjects);
      return true;
    }

    return false;
  }
}
