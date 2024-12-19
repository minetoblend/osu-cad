import type { IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent } from 'osucad-framework';
import type { ControlPoint } from '../../../controlPoints/ControlPoint';
import { Action, Component, dependencyLoader, PlatformAction, resolved } from 'osucad-framework';
import { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';

export class TimingScreenSelectionManager extends Component implements IKeyBindingHandler<PlatformAction> {
  #selection = new Set<ControlPoint>();

  selectionChanged = new Action<ControlPointSelectionEvent>();

  @resolved(ControlPointInfo)
  protected controlPointInfo!: ControlPointInfo;

  @dependencyLoader()
  [Symbol('load')]() {
    this.controlPointInfo.removed.addListener(this.#onControlPointRemoved, this);
  }

  #onControlPointRemoved(controlPoint: ControlPoint) {
    this.deselect(controlPoint);
  }

  get selectedObjects() {
    return this.#selection.values();
  }

  isSelected(controlPoint: ControlPoint) {
    return this.#selection.has(controlPoint);
  }

  select(controlPoint: ControlPoint) {
    if (this.isSelected(controlPoint))
      return false;

    this.#selection.add(controlPoint);
    this.selectionChanged.emit({
      controlPoint,
      selected: true,
    });

    return true;
  }

  deselect(controlPoint: ControlPoint) {
    if (!this.#selection.delete(controlPoint))
      return false;

    this.selectionChanged.emit({
      controlPoint,
      selected: false,
    });

    return true;
  }

  toggleSelection(controlPoint: ControlPoint) {
    if (this.isSelected(controlPoint))
      this.deselect(controlPoint);
    else
      this.select(controlPoint);
  }

  clear() {
    for (const controlPoint of this.#selection)
      this.selectionChanged.emit({ controlPoint, selected: false });
    this.#selection.clear();
  }

  setSelection(...selection: ControlPoint[]) {
    const newSelection = new Set(selection);

    const added = newSelection.difference(this.#selection);
    const removed = this.#selection.difference(newSelection);

    for (const controlPoint of added)
      this.select(controlPoint);
    for (const controlPoint of removed)
      this.deselect(controlPoint);
  }

  clear() {
    this.setSelection();
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.controlPointInfo.removed.removeListener(this.#onControlPointRemoved, this);
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
      ...this.controlPointInfo.controlPointLists.flatMap(it => it.items),
    );
  }
}

export interface ControlPointSelectionEvent {
  controlPoint: ControlPoint;
  selected: boolean;
}
