import type { Vec2 } from "../../math";
import type { InputState } from "../state/InputState";
import type { IInput } from "./IInput";
import type { IInputStateChangeHandler } from "./IInputStateChangeHandler";
import { MousePositionChangeEvent } from "./events/MousePositionChangeEvent";

export class MousePositionAbsoluteInput implements IInput
{
  public constructor(public readonly position: Vec2)
  {}

  public apply(state: InputState, handler: IInputStateChangeHandler): void
  {
    const mouse = state.mouse;

    if (!mouse.isPositionValid || !this.position.equals(mouse.position))
    {
      const lastPosition = mouse.isPositionValid ? mouse.position : this.position;
      mouse.isPositionValid = true;
      mouse.position = this.position;
      handler.handleInputStateChange(new MousePositionChangeEvent(state, this, lastPosition));
      mouse.lastSource = this;
    }
  }
}
