import type { KeyBindingAction } from "../KeyBindingAction";
import type { InputState } from "../state/InputState";
import { KeyBindingEvent } from "./KeyBindingEvent";

export class KeyBindingScrollEvent<T extends KeyBindingAction> extends KeyBindingEvent<T>
{
  public constructor(
    state: InputState,
    pressed: T,
    public readonly scrollAmount: number,
    public readonly isPrecise: boolean,
  )
  {
    super(state, "onScrollKeyBinding", pressed);
  }
}
