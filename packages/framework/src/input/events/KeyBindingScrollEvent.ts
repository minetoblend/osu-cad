import type { KeyBindingAction } from "../KeyBindingAction";
import type { InputState } from "../state/InputState";
import { KeyBindingEvent } from "./KeyBindingEvent";

export class KeyBindingScrollEvent<T extends KeyBindingAction> extends KeyBindingEvent<T>
{
  constructor(
    state: InputState,
    pressed: T,
    readonly scrollAmount: number,
    readonly isPrecise: boolean,
  )
  {
    super(state, "onScrollKeyBinding", pressed);
  }
}
