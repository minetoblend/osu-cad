import type { IKeyBindingHandler, KeyBindingPressEvent } from 'osucad-framework';
import type { OsuHitObject } from '../../../beatmap/hitObjects/OsuHitObject';
import type { SliderSelectionType } from '../../../beatmap/hitObjects/SliderSelection';
import { Action, Component, dependencyLoader, PlatformAction, resolved } from 'osucad-framework';
import { HitObjectList } from '../../../beatmap/hitObjects/HitObjectList';
import { Slider } from '../../../beatmap/hitObjects/Slider';

export class EditorSelection extends Component implements Iterable<OsuHitObject>, IKeyBindingHandler<PlatformAction> {
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

  [Symbol.iterator](): Iterator<OsuHitObject> {
    return this.#selection[Symbol.iterator]();
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: PlatformAction): boolean {
    return binding instanceof PlatformAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction>): boolean {
    if (e.pressed === PlatformAction.SelectAll) {
      this.selectAll();
      return true;
    }

    return false;
  }

  selectAll() {
    this.select(this.hitObjects.items);
  }

  override dispose(isDisposing: boolean = true) {
    for (const h of [...this.#selection])
      this.deselect(h);

    super.dispose(isDisposing);
  }
}
