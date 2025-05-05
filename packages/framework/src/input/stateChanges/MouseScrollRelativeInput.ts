import type { Vec2 } from "../../math";
import type { InputState } from "../state/InputState";
import type { IInput } from "./IInput";
import type { IInputStateChangeHandler } from "./IInputStateChangeHandler";
import { MouseScrollChangeEvent } from "./events/MouseScrollChangeEvent";

export class MouseScrollRelativeInput implements IInput 
{
  constructor(
    readonly delta: Vec2,
    readonly isPrecise: boolean,
  ) 
  {}

  apply(state: InputState, handler: IInputStateChangeHandler): void 
  {
    const mouse = state.mouse;

    if (this.delta.x !== 0 || this.delta.y !== 0) 
    {
      const lastScroll = mouse.scroll.clone();
      mouse.scroll = mouse.scroll.add(this.delta);

      handler.handleInputStateChange(new MouseScrollChangeEvent(state, this, lastScroll, this.isPrecise));
    }
  }
}
