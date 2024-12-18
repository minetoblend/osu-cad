import type { ColorSource } from 'pixi.js';
import type { TimingPoint } from '../../../../controlPoints/TimingPoint';
import { ControlPointPlacementBlueprint } from '../ControlPointPlacementBlueprint';

export class TimingPointPlacementBlueprint extends ControlPointPlacementBlueprint<TimingPoint> {
  constructor() {
    super();
  }

  protected override createInstance(): TimingPoint {
    return this.controlPointInfo.timingPointAt(this.timeAtMousePosition).deepClone();
  }

  protected override get layerColor(): ColorSource {
    return 0xFF265A;
  }

  protected override get invertShiftBehavior(): boolean {
    return true;
  }
}
