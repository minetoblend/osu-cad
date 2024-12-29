import type { Drawable } from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import type { TimingPoint } from '../../../../controlPoints/TimingPoint';
import { Anchor, Axes } from 'osucad-framework';
import { ControlPointPlacementBlueprint } from '../ControlPointPlacementBlueprint';
import { TimingPointKeyframeShape } from './TimingPointKeyframeShape';

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

  protected override createPreviewShape(): Drawable {
    return new TimingPointKeyframeShape().with({
      relativeSizeAxes: Axes.Y,
      width: 10,
      origin: Anchor.TopCenter,
    });
  }
}
