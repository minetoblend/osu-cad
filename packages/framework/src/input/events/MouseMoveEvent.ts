import type { Vec2 } from "../../math";
import type { InputState } from "../state/InputState";
import { MouseEvent } from "./MouseEvent";

export class MouseMoveEvent extends MouseEvent
{
  constructor(
    state: InputState,
    readonly lastPosition?: Vec2,
  )
  {
    super(state, "onMouseMove");
  }
}
