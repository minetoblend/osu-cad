import type { Vec2 } from "../../math";
import type { InputState } from "../state/InputState";
import { MouseButton } from "../state/MouseButton";
import { MouseEvent } from "./MouseEvent";

export class MouseDownEvent extends MouseEvent
{
  constructor(
    state: InputState,
    readonly button: MouseButton,
    readonly screenSpaceMouseDownPosition: Vec2 | null = null,
  )
  {
    super(state, "onMouseDown");
  }

  override toString(): string
  {
    return `MouseDownEvent(${MouseButton[this.button]})`;
  }
}
