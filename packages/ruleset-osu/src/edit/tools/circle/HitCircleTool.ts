import type { MouseUpEvent } from "@osucad/framework";
import { MouseButton, type MouseDownEvent, resolved, type Vec2 } from "@osucad/framework";
import { HitCircle } from "../../../hitObjects";
import { PlacementState } from "../HitObjectPlacementTool";
import type { IHitCircleToolPresence } from "./HitCircleToolPresence";
import { HitCircleToolPresenceOverlay } from "./HitCircleToolPresence";
import { OsuHitObjectPlacementTool } from "../OsuHitObjectPlacementTool";
import { OsuPlayfield } from "../../../ui";
import iconUrl from "./icon.png";
import { SnapManager } from "../../SnapManager";
import { ComposeTool } from "@osucad/editor";

@ComposeTool.metadata({
  id: "circle",
  label: "Hitcircle",
  icon: iconUrl,
  presenceOverlay: HitCircleToolPresenceOverlay,
})
export class HitCircleTool extends OsuHitObjectPlacementTool<HitCircle>
{
  protected override createHitObject(): HitCircle
  {
    return new HitCircle();
  }

  @resolved(SnapManager)
  accessor #snapManager!: SnapManager

  protected override updateTimeAndPosition(hitObject: HitCircle, time: number, position: Vec2): void
  {
    const snapResult = this.#snapManager.getClosestSnapResult({
      points: [position],
      snapTo: {
        hitObjects: {
          exclude: [this.hitObject],
        },
      },
      maxDistance: 10,
    });

    if (snapResult)
      position = snapResult.position;

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
