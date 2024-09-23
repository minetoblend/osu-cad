import type { IKeyBindingHandler } from '../bindings/IKeyBindingHandler';
import type { IInputReceiver } from '../IInputReceiver';
import type { KeyBindingAction } from '../KeyBindingAction';
import type { InputState } from '../state/InputState';
import { UIEvent } from './UIEvent';

export class KeyBindingEvent<T extends KeyBindingAction> extends UIEvent {
  constructor(
    state: InputState,
    handler: keyof IInputReceiver | keyof IKeyBindingHandler<any>,
    readonly pressed: T,
  ) {
    super(state, handler as keyof IInputReceiver);
  }
}
