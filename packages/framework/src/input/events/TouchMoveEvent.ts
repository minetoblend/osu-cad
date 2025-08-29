import type { Vec2 } from "../../math";
import type { Touch } from "../handlers/Touch";
import type { InputState } from "../state/InputState";
import { TouchEvent } from "./TouchEvent";

export class TouchMoveEvent extends TouchEvent
{
  public constructor(
    state: InputState,
    touch: Touch,
    screenSpaceTouchDownPosition: Vec2 | null,
    public readonly screenSpaceLastTouchPosition: Vec2,
  )
  {
    super(state, "onTouchMove", touch, screenSpaceTouchDownPosition);
  }
}
