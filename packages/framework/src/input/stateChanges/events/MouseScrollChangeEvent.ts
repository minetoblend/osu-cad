import type { Vec2 } from "../../../math";
import type { InputState } from "../../state/InputState";
import type { IInput } from "../IInput";
import { InputStateChangeEvent } from "./InputStateChangeEvent";

export class MouseScrollChangeEvent extends InputStateChangeEvent
{
  public constructor(
    state: InputState,
    input: IInput,
    public readonly lastScroll: Vec2,
    public readonly isPrecise: boolean,
  )
  {
    super(state, input);
  }
}
