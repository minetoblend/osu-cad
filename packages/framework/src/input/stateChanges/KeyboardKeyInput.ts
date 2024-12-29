import type { ButtonStates } from '../state/ButtonStates';
import type { InputState } from '../state/InputState';
import type { Key } from '../state/Key';
import { ButtonInput, ButtonInputEntry } from './ButtonInput';

export class KeyboardKeyInput extends ButtonInput<Key> {
  constructor(entries: ButtonInputEntry<Key>[]) {
    super(entries);
  }

  static create(key: Key, isPressed: boolean): KeyboardKeyInput {
    return new KeyboardKeyInput([new ButtonInputEntry(key, isPressed)]);
  }

  protected getButtonStates(state: InputState): ButtonStates<Key> {
    return state.keyboard.keys;
  }
}
