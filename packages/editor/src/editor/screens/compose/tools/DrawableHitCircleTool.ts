import type { MouseDownEvent, MouseMoveEvent, MouseUpEvent } from 'osucad-framework';
import { HitCircle } from '@osucad/common';
import { MouseButton } from 'osucad-framework';
import { DrawableHitObjectPlacementTool } from './DrawableHitObjectPlacementTool';

export class DrawableHitCircleTool extends DrawableHitObjectPlacementTool<HitCircle> {
  constructor() {
    super();
  }

  createObject(): HitCircle {
    const circle = new HitCircle();

    circle.position = this.getSnappedPosition(this.mousePosition);
    circle.startTime = this.beatmap.controlPoints.snap(this.editorClock.currentTime, this.beatSnapDivisor);
    circle.newCombo = this.newCombo.value;

    circle.hitSound = this.hitSoundState.asHitSound();

    return circle;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      if (!this.isPlacing)
        this.beginPlacing();

      return true;
    }
    return false;
  }

  onMouseUp(e: MouseUpEvent) {
    if (e.button === MouseButton.Left) {
      if (this.isPlacing) {
        this.finishPlacing();
        return true;
      }
    }
    return false;
  }

  onMouseMove(e: MouseMoveEvent): boolean {
    if (this.isPlacing) {
      this.hitObject.position = this.getSnappedPosition(e.mousePosition);
    }
    return true;
  }
}
