import type { InputState } from "../state/InputState";
import type { IInput } from "./IInput";
import type { IInputStateChangeHandler } from "./IInputStateChangeHandler";

export class PressureInput implements IInput
{
  public constructor(public readonly pressure: number)
  {
  }

  public apply(state: InputState, handler: IInputStateChangeHandler)
  {
    state.mouse.pressure = this.pressure;
  }
}
