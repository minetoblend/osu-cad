import type { InputState } from "../../state/InputState";
import type { IInput } from "../IInput";

export abstract class InputStateChangeEvent
{
  constructor(
    readonly state: InputState,
    readonly input: IInput,
  )
  {}
}
