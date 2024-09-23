import type { Vec2 } from '../../math';
import type { Touch } from '../handlers/Touch';
import type { InputState } from '../state/InputState';
import { UIEvent } from './UIEvent';

export class TouchUpEvent extends UIEvent {
  constructor(
    state: InputState,
    readonly touch: Touch,
    readonly touchDownPosition: Vec2 | null,
  ) {
    super(state, 'onTouchUp');
  }
}
