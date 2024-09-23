import type { Vec2 } from '../../math';
import type { InputState } from '../state/InputState';
import { UIEvent } from './UIEvent';

export class ScrollEvent extends UIEvent {
  constructor(
    state: InputState,
    readonly scrollDelta: Vec2,
    readonly isPrecise: boolean = false,
  ) {
    super(state, 'onScroll');
  }
}
