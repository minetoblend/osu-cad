import type { HitObject } from '../../../hitObjects/HitObject';
import { Action, Component, type KeyBindingAction, type KeyBindingPressEvent, PlatformAction, resolved } from '@osucad/framework';
import { EditorBeatmap } from '../../EditorBeatmap';

export class HitObjectSelectionManager<T extends HitObject = HitObject> extends Component {
  #selection = new Set<T>();

  selectionChanged = new Action<HitObjectSelectionEvent<T>>();

  @resolved(EditorBeatmap)
  protected beatmap!: EditorBeatmap<T>;

  protected override loadComplete() {
    super.loadComplete();

    this.beatmap.hitObjects.removed.addListener(this.#onHitObjectRemoved, this);
  }

  get length() {
    return this.#selection.size;
  }

  #onHitObjectRemoved(hitObject: T) {
    this.deselect(hitObject);
  }

  get selectedObjects() {
    return this.#selection.values();
  }

  isSelected(hitObject: T) {
    return this.#selection.has(hitObject);
  }

  select(hitObject: T) {
    if (this.isSelected(hitObject))
      return false;

    this.#selection.add(hitObject);
    this.selectionChanged.emit({
      hitObject,
      selected: true,
    });

    return true;
  }

  deselect(hitObject: T) {
    if (!this.#selection.delete(hitObject))
      return false;

    this.selectionChanged.emit({
      hitObject,
      selected: false,
    });

    return true;
  }

  toggleSelection(hitObject: T) {
    if (this.isSelected(hitObject))
      this.deselect(hitObject);
    else
      this.select(hitObject);
  }

  clear() {
    const selection = [...this.#selection];
    this.#selection.clear();

    for (const hitObject of selection)
      this.selectionChanged.emit({ hitObject, selected: false });
  }

  setSelection(...selection: T[]) {
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

    this.beatmap.hitObjects.removed.removeListener(this.#onHitObjectRemoved, this);
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
      ...this.beatmap.hitObjects,
    );
  }
}

export interface HitObjectSelectionEvent<T extends HitObject = HitObject> {
  hitObject: T;
  selected: boolean;
}
