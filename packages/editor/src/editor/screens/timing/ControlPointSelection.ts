import { Action } from 'osucad-framework';
import type { ControlPointInfo } from '../../../beatmap/timing/ControlPointInfo';
import type { ControlPointGroup } from '../../../beatmap/timing/ControlPointGroup';

export class ControlPointSelection {
  constructor(
    private readonly controlPoints: ControlPointInfo,
  ) {
    controlPoints.groupRemoved.addListener(this.deselect, this);
  }

  selection = new Set<ControlPointGroup>();

  selectionChanged = new Action<[ControlPointGroup, boolean]>();

  isSelected(c: ControlPointGroup) {
    return this.selection.has(c);
  }

  select(c: ControlPointGroup) {
    if (this.isSelected(c))
      return;

    this.selection.add(c);
    this.selectionChanged.emit([c, true]);
  }

  deselect(c: ControlPointGroup) {
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

  selectUntil(c: ControlPointGroup) {
    const start = [...this.selection].pop();
    if (!start || start === c)
      return;

    const startIndex = this.controlPoints.groups.indexOf(start);

    const endIndex = this.controlPoints.groups.indexOf(c);

    if (startIndex === -1 || endIndex === -1)
      return;

    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);

    this.clear();
    for (let i = minIndex; i <= maxIndex; i++) {
      this.select(this.controlPoints.groups.get(i)!);
    }
  }
}
