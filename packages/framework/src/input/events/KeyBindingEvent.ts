import type { IKeyBindingHandler } from "../bindings/IKeyBindingHandler";
import type { IInputReceiver } from "../IInputReceiver";
import type { KeyBindingAction } from "../KeyBindingAction";
import type { InputState } from "../state/InputState";
import { UIEvent } from "./UIEvent";

export class KeyBindingEvent<T extends KeyBindingAction> extends UIEvent
{
  public constructor(
    state: InputState,
    handler: keyof IInputReceiver | keyof IKeyBindingHandler<any>,
    public readonly pressed: T,
  )
  {
    super(state, handler as keyof IInputReceiver);
  }
}
