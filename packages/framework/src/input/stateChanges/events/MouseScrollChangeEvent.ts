import type { Vec2 } from "../../../math";
import type { InputState } from "../../state/InputState";
import type { IInput } from "../IInput";
import { InputStateChangeEvent } from "./InputStateChangeEvent";

export class MouseScrollChangeEvent extends InputStateChangeEvent 
{
  constructor(
    state: InputState,
    input: IInput,
    readonly lastScroll: Vec2,
    readonly isPrecise: boolean,
  ) 
  {
    super(state, input);
  }
}
