import type { Vec2 } from "../../../math";
import type { Touch } from "../../handlers/Touch";
import type { InputState } from "../../state/InputState";
import type { TouchInput } from "../TouchInput";
import { InputStateChangeEvent } from "./InputStateChangeEvent";

export class TouchStateChangeEvent extends InputStateChangeEvent
{
  public constructor(state: InputState, input: TouchInput, touch: Touch, activate: boolean | null, lastPosition: Vec2 | null)
  {
    super(state, input);

    this.touch = touch;
    this.isActive = activate;
    this.lastPosition = lastPosition;
  }

  public readonly touch: Touch;
  public readonly isActive: boolean | null;
  public readonly lastPosition: Vec2 | null;
}
