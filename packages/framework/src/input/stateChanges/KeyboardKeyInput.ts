import type { ButtonStates } from "../state/ButtonStates";
import type { InputState } from "../state/InputState";
import type { Key } from "../state/Key";
import { ButtonInput, ButtonInputEntry } from "./ButtonInput";
import type { ButtonStateChangeKind } from "./events";
import { ButtonStateChangeEvent } from "./events";

export class KeyboardKeyInput extends ButtonInput<Key>
{
  constructor(entries: ButtonInputEntry<Key>[], readonly event?: KeyboardEvent)
  {
    super(entries);
  }

  static create(key: Key, isPressed: boolean, event?: KeyboardEvent): KeyboardKeyInput
  {
    return new KeyboardKeyInput([new ButtonInputEntry(key, isPressed)], event);
  }

  protected getButtonStates(state: InputState): ButtonStates<Key>
  {
    return state.keyboard.keys;
  }

  protected override createEvent(state: InputState, button: Key, kind: ButtonStateChangeKind): ButtonStateChangeEvent<Key>
  {
    return new ButtonStateChangeEvent<Key>(state, this, button, kind, this.event);
  }
}
