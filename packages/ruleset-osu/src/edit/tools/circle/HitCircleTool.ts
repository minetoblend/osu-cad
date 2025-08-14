import type { MouseUpEvent } from "@osucad/framework";
import { MouseButton, type MouseDownEvent, type Vec2 } from "@osucad/framework";
import { HitCircle } from "../../../hitObjects";
import { HitObjectPlacementTool, PlacementState } from "../HitObjectPlacementTool";

export class HitCircleTool extends HitObjectPlacementTool<HitCircle>
{
  protected override createHitObject(): HitCircle
  {
    return new HitCircle();
  }

  protected override updateTimeAndPosition(hitObject: HitCircle, time: number, position: Vec2): void
  {
    hitObject.position = position;
    hitObject.startTime = time;
  }

  override onMouseDown(e: MouseDownEvent): boolean
  {
    if (e.button === MouseButton.Left && this.state === PlacementState.Idle)
      this.beginPlacement();

    return true;
  }

  override onMouseUp(e: MouseUpEvent): void
  {
    if (e.button === MouseButton.Left && this.isPlacementActive)
    {
      this.endPlacement(true);
    }
  }
}
