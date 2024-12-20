import type { HitObject } from '../../../hitObjects/HitObject';
import { Action, Component, dependencyLoader, type KeyBindingAction, type KeyBindingPressEvent, PlatformAction, resolved } from 'osucad-framework';
import { HitObjectList } from '../../../beatmap/HitObjectList';

export class HitObjectSelectionManager extends Component {
  #selection = new Set<HitObject>();

  selectionChanged = new Action<HitObjectSelectionEvent>();

  @resolved(HitObjectList)
  protected hitObjects!: HitObjectList;

  @dependencyLoader()
  [Symbol('load')]() {
    this.hitObjects.removed.addListener(this.#onHitObjectRemoved, this);
  }

  #onHitObjectRemoved(hitObject: HitObject) {
    this.deselect(hitObject);
  }

  get selectedObjects() {
    return this.#selection.values();
  }

  isSelected(hitObject: HitObject) {
    return this.#selection.has(hitObject);
  }

  select(hitObject: HitObject) {
    if (this.isSelected(hitObject))
      return false;

    this.#selection.add(hitObject);
    this.selectionChanged.emit({
      hitObject,
      selected: true,
    });

    return true;
  }

  deselect(hitObject: HitObject) {
    if (!this.#selection.delete(hitObject))
      return false;

    this.selectionChanged.emit({
      hitObject,
      selected: false,
    });

    return true;
  }

  toggleSelection(hitObject: HitObject) {
    if (this.isSelected(hitObject))
      this.deselect(hitObject);
    else
      this.select(hitObject);
  }

  clear() {
    for (const controlPoint of this.#selection)
      this.selectionChanged.emit({ hitObject: controlPoint, selected: false });
    this.#selection.clear();
  }

  setSelection(...selection: HitObject[]) {
    const newSelection = new Set(selection);

    const added = newSelection.difference(this.#selection);
    const removed = this.#selection.difference(newSelection);

    for (const hitObject of added)
      this.select(hitObject);
    for (const hitObject of removed)
      this.deselect(hitObject);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.hitObjects.removed.removeListener(this.#onHitObjectRemoved, this);
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(action: KeyBindingAction): boolean {
    return action instanceof PlatformAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction>): boolean {
    switch (e.pressed) {
      case PlatformAction.SelectAll:
        this.selectAll();
        return true;
    }

    return false;
  }

  selectAll() {
    this.setSelection(
      ...this.hitObjects,
    );
  }
}

export interface HitObjectSelectionEvent {
  hitObject: HitObject;
  selected: boolean;
}
