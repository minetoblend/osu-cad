import { ComposeTool } from "@osucad/editor";
import { HitCircle } from "../../../hitObjects";
import type { MouseDownEvent } from "@osucad/framework";
import { MouseButton } from "@osucad/framework";

export class HitCircleTool extends ComposeTool<HitCircle>
{
  circle!: HitCircle;

  createObject()
  {
    const circle = new HitCircle();

    circle.startTime = this.beatmap.controlPointInfo.snap(this.editorClock.currentTime, this.beatDivisor.value);
    circle.position = this.playfield.toLocalSpace(this.mousePosition);

    this.beatmap.hitObjects.add(this.circle = circle);
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.createObject();
  }

  override update()
  {
    super.update();

    this.circle.startTime = this.editorClock.currentTime;
    this.circle.position = this.playfield.toLocalSpace(this.mousePosition);
  }

  get mousePosition()
  {
    return this.getContainingInputManager()!.currentState.mouse.position;
  }

  override onMouseDown(e: MouseDownEvent): boolean
  {
    if (e.button === MouseButton.Right)
    {
      this.circle.newCombo = !this.circle.newCombo;
    }

    return true;
  }

  override dispose()
  {
    if (this.circle)
    {
      this.beatmap.hitObjects.remove(this.circle);
    }

    super.dispose();
  }
}
