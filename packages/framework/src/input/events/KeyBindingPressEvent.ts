import type { KeyBindingAction } from "../KeyBindingAction";
import type { InputState } from "../state/InputState";
import { KeyBindingEvent } from "./KeyBindingEvent";

export class KeyBindingPressEvent<T extends KeyBindingAction> extends KeyBindingEvent<T>
{
  constructor(
    state: InputState,
    pressed: T,
    readonly repeat: boolean = false,
  )
  {
    super(state, "onKeyBindingPressed", pressed);
  }
}
