import type { ColorSource } from 'pixi.js';
import type { DifficultyPoint } from '../../../../controlPoints/DifficultyPoint';
import { ControlPointPlacementBlueprint } from '../ControlPointPlacementBlueprint';

export class TimingPointPlacementBlueprint extends ControlPointPlacementBlueprint<DifficultyPoint> {
  constructor() {
    super();
  }

  protected override createInstance(): DifficultyPoint {
    return this.controlPointInfo.difficultyPointAt(this.timeAtMousePosition).deepClone();
  }

  protected override get layerColor(): ColorSource {
    return 0xFFBE40;
  }
}
