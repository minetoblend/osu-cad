import type { ControlPoint, ControlPointManager } from '@osucad/common';
import { Action } from 'osucad-framework';

export class ControlPointSelection {
  constructor(
    private readonly controlPoints: ControlPointManager,
  ) {

  }

  selection = new Set<ControlPoint>();

  selectionChanged = new Action<[ControlPoint, boolean]>();

  isSelected(c: ControlPoint) {
    return this.selection.has(c);
  }

  select(c: ControlPoint) {
    if (this.isSelected(c))
      return;

    this.selection.add(c);
    this.selectionChanged.emit([c, true]);
  }

  deselect(c: ControlPoint) {
    if (!this.isSelected(c))
      return;

    this.selection.delete(c);
    this.selectionChanged.emit([c, false]);
  }

  clear() {
    for (const c of this.selection) {
      this.selectionChanged.emit([c, false]);
    }
    this.selection.clear();
  }

  selectUntil(c: ControlPoint) {
    const start = [...this.selection].pop();
    if (!start || start === c)
      return;

    const startIndex = this.controlPoints.controlPoints.indexOf(start);

    const endIndex = this.controlPoints.controlPoints.indexOf(c);

    if (startIndex === -1 || endIndex === -1)
      return;

    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);

    this.clear();
    for (let i = minIndex; i <= maxIndex; i++) {
      this.select(this.controlPoints.controlPoints[i]);
    }
  }
}
