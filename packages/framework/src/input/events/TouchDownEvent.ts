import type { Touch } from '../handlers/Touch';
import type { InputState } from '../state/InputState';
import { UIEvent } from './UIEvent';

export class TouchDownEvent extends UIEvent {
  constructor(
    state: InputState,
    readonly touch: Touch,
  ) {
    super(state, 'onTouchDown');
  }
}
