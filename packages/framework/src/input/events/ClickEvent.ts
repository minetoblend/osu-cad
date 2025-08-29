import type { Vec2 } from "../../math";
import type { InputState } from "../state/InputState";
import { MouseButton } from "../state/MouseButton";
import { UIEvent } from "./UIEvent";

export class ClickEvent extends UIEvent
{
  public constructor(
    state: InputState,
    public readonly button: MouseButton,
    public readonly screenSpaceMouseDownPosition: Vec2 | null = null,
  )
  {
    super(state, "onClick");
  }

  public override toString(): string
  {
    return `ClickEvent(${MouseButton[this.button]})`;
  }
}
