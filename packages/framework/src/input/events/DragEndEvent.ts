import type { Vec2 } from "../../math";
import type { InputState } from "../state/InputState";
import type { MouseButton } from "../state/MouseButton";
import { UIEvent } from "./UIEvent";

export class DragEndEvent extends UIEvent
{
  public constructor(
    state: InputState,
    public readonly button: MouseButton,
    public readonly screenSpaceMouseDownPosition: Vec2 | null = null,
  )
  {
    super(state, "onDragEnd");
  }
}
