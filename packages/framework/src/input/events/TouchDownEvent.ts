import type { Vec2 } from "../../math/Vec2";
import type { Touch } from "../handlers/Touch";
import type { InputState } from "../state/InputState";
import { TouchEvent } from "./TouchEvent";

export class TouchDownEvent extends TouchEvent 
{
  constructor(
    state: InputState,
    touch: Touch,
    screenSpaceTouchDownPosition: Vec2 | null = null,
  ) 
  {
    super(state, "onTouchDown", touch, screenSpaceTouchDownPosition);
  }
}
