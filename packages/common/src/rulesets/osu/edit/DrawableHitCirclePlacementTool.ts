import type { MouseDownEvent, MouseUpEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import { MouseButton } from 'osucad-framework';
import { HitCircle } from '../hitObjects/HitCircle';
import { DrawableOsuHitObjectPlacementTool } from './DrawableOsuHitObjectPlacementTool';

export class DrawableHitCirclePlacementTool extends DrawableOsuHitObjectPlacementTool<HitCircle> {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);
  }

  protected override createHitObject(): HitCircle {
    const circle = new HitCircle();

    circle.position = this.snappedMousePosition;

    return circle;
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
