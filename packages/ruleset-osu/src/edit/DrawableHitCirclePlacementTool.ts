import type { MouseDownEvent, MouseUpEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import { MouseButton } from '@osucad/framework';
import { HitCircle } from '../hitObjects/HitCircle';
import { DrawableOsuHitObjectPlacementTool } from './DrawableOsuHitObjectPlacementTool';

export class DrawableHitCirclePlacementTool extends DrawableOsuHitObjectPlacementTool<HitCircle> {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);
  }

  protected override createHitObject(): HitCircle {
    return new HitCircle();
  }

  override update() {
    super.update();

    this.hitObject.position = this.snappedMousePosition;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left)
      this.beginPlacement();

    if (e.button === MouseButton.Right) {
      this.newCombo.toggle();
    }

    return true;
  }

  override onMouseUp(e: MouseUpEvent) {
    if (e.button === MouseButton.Left) {
      this.endPlacement();
    }
  }
}
