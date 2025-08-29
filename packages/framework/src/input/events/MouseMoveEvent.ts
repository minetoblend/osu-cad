import type { Vec2 } from "../../math";
import type { InputState } from "../state/InputState";
import { MouseEvent } from "./MouseEvent";

export class MouseMoveEvent extends MouseEvent
{
  public constructor(
    state: InputState,
    public readonly lastPosition?: Vec2,
  )
  {
    super(state, "onMouseMove");
  }
}
