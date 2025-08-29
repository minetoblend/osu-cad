import type { Vec2 } from "../../../math";
import type { InputState } from "../../state/InputState";
import type { IInput } from "../IInput";
import { InputStateChangeEvent } from "./InputStateChangeEvent";

export class MousePositionChangeEvent extends InputStateChangeEvent
{
  public constructor(
    state: InputState,
    input: IInput,
    public readonly lastPosition: Vec2,
  )
  {
    super(state, input);
  }
}
