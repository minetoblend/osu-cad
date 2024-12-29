import type { Vec2 } from '../../math';
import type { TouchStateChangeEvent } from './events/TouchStateChangeEvent';
import { MousePositionAbsoluteInput } from './MousePositionAbsoluteInput';

export class MousePositionAbsoluteInputFromTouch extends MousePositionAbsoluteInput {
  constructor(
    readonly touchEvent: TouchStateChangeEvent,
    position: Vec2,
  ) {
    super(position);
  }
}
