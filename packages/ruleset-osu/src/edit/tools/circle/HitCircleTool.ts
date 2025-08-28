import type { MouseUpEvent } from "@osucad/framework";
import { almostEquals, MouseButton, type MouseDownEvent, type Vec2 } from "@osucad/framework";
import type { OsuHitObject } from "../../../hitObjects";
import { HitCircle } from "../../../hitObjects";
import { PlacementState } from "../HitObjectPlacementTool";
import type { IHitCircleToolPresence } from "./HitCircleToolPresence";
import { OsuHitObjectPlacementTool } from "../OsuHitObjectPlacementTool";


export class HitCircleTool extends OsuHitObjectPlacementTool<HitCircle>
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

  protected override onPlacementBegin(): void
  {
    const time = this.hitObject.startTime;

    const toDelete = this.beatmap.hitObjects.filter(it => almostEquals(it.startTime, time, 1) && it !== this.hitObject);

    for (const h of toDelete)
      this.beatmap.hitObjects.remove(h);
  }

  override getPresence(): IHitCircleToolPresence
  {
    return {
      state: this.state,
      scale: this.hitObject.scale,
      position: { ...this.hitObject.position },
    };
  }
}
