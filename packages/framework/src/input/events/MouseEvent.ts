import type { IInputReceiver } from '../IInputReceiver';
import type { InputState } from '../state/InputState';
import { UIEvent } from './UIEvent';

export class MouseEvent extends UIEvent {
  constructor(
    state: InputState,
    handler: keyof IInputReceiver,
  ) {
    super(state, handler);
  }
}
