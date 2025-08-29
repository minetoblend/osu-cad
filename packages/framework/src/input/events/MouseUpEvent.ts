import type { Vec2 } from "../../math";
import type { InputState } from "../state/InputState";
import { MouseButton } from "../state/MouseButton";
import { MouseEvent } from "./MouseEvent";

export class MouseUpEvent extends MouseEvent
{
  public constructor(
    state: InputState,
    public readonly button: MouseButton,
    public readonly screenSpaceMouseDownPosition: Vec2 | null = null,
  )
  {
    super(state, "onMouseUp");
  }

  public override toString(): string
  {
    return `MouseUpEvent(${MouseButton[this.button]})`;
  }
}
