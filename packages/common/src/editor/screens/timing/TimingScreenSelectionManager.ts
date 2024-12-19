import type { ControlPoint } from '../../../controlPoints/ControlPoint';
import { Action, Component, dependencyLoader, resolved } from 'osucad-framework';
import { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';

export class TimingScreenSelectionManager extends Component {
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

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.controlPointInfo.removed.removeListener(this.#onControlPointRemoved, this);
  }
}

export interface ControlPointSelectionEvent {
  controlPoint: ControlPoint;
  selected: boolean;
}
