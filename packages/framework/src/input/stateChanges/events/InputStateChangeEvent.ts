import type { InputState } from "../../state/InputState";
import type { IInput } from "../IInput";

export abstract class InputStateChangeEvent
{
  public constructor(
    public readonly state: InputState,
    public readonly input: IInput,
  )
  {}
}
