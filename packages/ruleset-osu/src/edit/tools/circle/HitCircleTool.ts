import type { MouseUpEvent } from "@osucad/framework";
import { MouseButton, type MouseDownEvent, type Vec2 } from "@osucad/framework";
import type { OsuHitObject } from "../../../hitObjects";
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
    for (const obj of this.playfield.hitObjectContainer.aliveObjects)
    {
      const h = obj.hitObject as OsuHitObject;

      if (obj.hitObject === hitObject)
        continue;

      const distance = this.playfield.toSpaceOfOtherDrawable(h.position, this).distance(this.playfield.toSpaceOfOtherDrawable(position, this));
      if (distance < 10)
      {
        position = h.position;
        break;
      }
    }

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
