import type { MouseDownEvent, MouseUpEvent } from 'osucad-framework';
import { MouseButton } from 'osucad-framework';
import { HitCircle } from '../hitObjects/HitCircle';
import { DrawableOsuHitObjectPlacementTool } from './DrawableOsuHitObjectPlacementTool';

export class DrawableHitCirclePlacementTool extends DrawableOsuHitObjectPlacementTool<HitCircle> {
  protected override createHitObject(): HitCircle {
    return new HitCircle();
  }

  override update() {
    super.update();

    this.hitObject.position = this.snappedMousePosition;
    this.hitObject.startTime = this.editorClock.currentTime;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left)
      this.beginPlacement();

    return true;
  }

  override onMouseUp(e: MouseUpEvent) {
    if (e.button === MouseButton.Left) {
      this.endPlacement();
    }
  }
}
