import type { InputState } from "../../state/InputState";
import type { ButtonInput } from "../ButtonInput";
import type { ButtonStateChangeKind } from "./ButtonStateChangeKind";
import { InputStateChangeEvent } from "./InputStateChangeEvent";

export class ButtonStateChangeEvent<TButton> extends InputStateChangeEvent 
{
  constructor(
    state: InputState,
    input: ButtonInput<TButton>,
    public button: TButton,
    public kind: ButtonStateChangeKind,
  ) 
  {
    super(state, input);
  }
}
