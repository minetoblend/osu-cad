import type { MouseUpEvent } from "@osucad/framework";
import { MouseButton, type MouseDownEvent, type Vec2 } from "@osucad/framework";
import type { OsuHitObject } from "../../../hitObjects";
import { HitCircle } from "../../../hitObjects";
import { PlacementState } from "../HitObjectPlacementTool";
import type { IHitCircleToolPresence } from "./HitCircleToolPresence";
import { HitCircleToolPresenceOverlay } from "./HitCircleToolPresence";
import { OsuHitObjectPlacementTool } from "../OsuHitObjectPlacementTool";
import { OsuPlayfield } from "../../../ui";


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

    position = position.clamp(OsuPlayfield.BOUNDS);

    hitObject.position = position;
    hitObject.startTime = time;
  }

  protected override onMouseDown(e: MouseDownEvent): boolean
  {
    if (e.button === MouseButton.Left && this.state === PlacementState.Idle)
      this.beginPlacement();

    if (e.button === MouseButton.Right && !this.isPlacementActive)
      this.hitObject.newCombo = !this.hitObject.newCombo;

    return true;
  }

  protected override onMouseUp(e: MouseUpEvent): void
  {
    if (e.button === MouseButton.Left && this.isPlacementActive)
      this.endPlacement(true);
  }

  public override getPresence(): IHitCircleToolPresence
  {
    return {
      state: this.state,
      scale: this.hitObject.scale,
      position: { ...this.hitObject.position },
    };
  }
}

export namespace HitCircleTool
{
  export const id = "circle";
  export const label = "Hitcircle";
  export const tool = HitCircleTool;
  export const icon = new URL("./icon.png", import.meta.url).href;
  export const presenceOverlay = HitCircleToolPresenceOverlay;
}
