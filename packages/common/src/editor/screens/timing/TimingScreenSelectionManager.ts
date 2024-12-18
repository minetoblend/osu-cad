import type { ControlPoint } from '../../../controlPoints/ControlPoint';
import { Action, Component } from 'osucad-framework';

export class TimingScreenSelectionManager extends Component {
  #selection = new Set<ControlPoint>();

  selectionChanged = new Action<ControlPointSelectionEvent>();

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
}

export interface ControlPointSelectionEvent {
  controlPoint: ControlPoint;
  selected: boolean;
}
