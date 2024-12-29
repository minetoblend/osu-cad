import type { Vec2 } from '../../math';
import type { TouchSource } from '../handlers/Touch';
import type { InputState } from '../state/InputState';
import { UIEvent } from './UIEvent';

export class TouchMoveEvent extends UIEvent {
  constructor(
    state: InputState,
    readonly source: TouchSource,
    readonly position: Vec2,
    readonly lastPosition: Vec2,
  ) {
    super(state, 'onTouchMove');
  }
}
