import type { Drawable } from '@osucad/framework';
import type { ColorSource } from 'pixi.js';
import { Anchor, Axes, clamp } from '@osucad/framework';
import { VolumePoint } from '../../../../controlPoints/VolumePoint';
import { ControlPointPlacementBlueprint } from '../ControlPointPlacementBlueprint';

export class VolumePointPlacementBlueprint extends ControlPointPlacementBlueprint<VolumePoint> {
  constructor() {
    super();
  }

  protected override get layerColor(): ColorSource {
    return 0x4763ED;
  }

  protected override createInstance(): VolumePoint {
    return new VolumePoint(0, 100);
  }

  protected override createPreviewShape(): Drawable {
    return super.createPreviewShape().with({
      relativePositionAxes: Axes.Y,
      anchor: Anchor.TopLeft,
    });
  }

  protected override updateControlPoint(controlPoint: VolumePoint) {
    super.updateControlPoint(controlPoint);

    controlPoint.volume = this.volumeAtMousePosition;
  }

  protected override updatePreviewShapePosition(shape: Drawable) {
    super.updatePreviewShapePosition(shape);

    shape.y = 1 - this.volumeAtMousePosition / 100;
  }

  protected get volumeAtMousePosition() {
    const position = this.toLocalSpace(this.inputManager.currentState.mouse.position);

    return clamp(100 * (1 - position.y / this.drawHeight), 5, 100);
  }
}
