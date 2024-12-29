import type { Vec2 } from '../../math';
import type { InputState } from '../state/InputState';
import { UIEvent } from './UIEvent';

export class MouseMoveEvent extends UIEvent {
  constructor(
    state: InputState,
    readonly lastPosition?: Vec2,
  ) {
    super(state, 'onMouseMove');
  }
}
