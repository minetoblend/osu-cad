import type { Additions } from '@osucad/common';
import type { Bindable, MouseDownEvent, MouseMoveEvent, MouseUpEvent } from 'osucad-framework';
import { MouseButton } from 'osucad-framework';
import { HitCircle } from '../../../../beatmap/hitObjects/HitCircle';
import { DrawableHitObjectPlacementTool } from './DrawableHitObjectPlacementTool';

export class DrawableHitCircleTool extends DrawableHitObjectPlacementTool<HitCircle> {
  constructor() {
    super();
  }

  createObject(): HitCircle {
    const circle = new HitCircle();

    circle.position = this.getSnappedPosition(this.mousePosition);
    circle.startTime = this.editorClock.currentTime;

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

  applySampleType(addition: Additions, bindable: Bindable<boolean>): void {
    throw new Error('Method not implemented.');
  }
}
