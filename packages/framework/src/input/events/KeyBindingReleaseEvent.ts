import type { KeyBindingAction } from '../KeyBindingAction';
import type { InputState } from '../state/InputState';
import { KeyBindingEvent } from './KeyBindingEvent';

export class KeyBindingReleaseEvent<T extends KeyBindingAction> extends KeyBindingEvent<T> {
  constructor(state: InputState, pressed: T) {
    super(state, 'onKeyBindingReleased', pressed);
  }
}
