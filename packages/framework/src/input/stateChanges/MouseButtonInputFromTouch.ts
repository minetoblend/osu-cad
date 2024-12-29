import type { MouseButton } from '../state/MouseButton';
import type { TouchStateChangeEvent } from './events/TouchStateChangeEvent';
import { ButtonInputEntry } from './ButtonInput';
import { MouseButtonInput } from './MouseButtonInput';

export class MouseButtonInputFromTouch extends MouseButtonInput {
  constructor(
    button: MouseButton,
    isPressed: boolean,
    readonly touchEvent: TouchStateChangeEvent,
  ) {
    super([new ButtonInputEntry(button, isPressed)]);
  }
}
