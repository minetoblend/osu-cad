import type { MouseDownEvent, MouseUpEvent } from '@osucad/framework';
import { MouseButton } from '@osucad/framework';
import { HitCircle } from '@osucad/ruleset-osu';
import { DrawablePlaceHitObjectTool } from './DrawablePlaceHitObjectTool';

export class DrawablePlaceCircleTool extends DrawablePlaceHitObjectTool<HitCircle> {
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
