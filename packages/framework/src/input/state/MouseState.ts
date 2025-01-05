import type { IInput } from '../stateChanges/IInput';
import type { MouseButton } from './MouseButton';
import { Vec2 } from '../../math';
import { ButtonStates } from './ButtonStates';

export class MouseState {
  readonly buttons = new ButtonStates<MouseButton>();

  position = new Vec2();

  isPositionValid = false;

  scroll = new Vec2();

  pressure = 1;

  lastSource?: IInput;

  isPressed(button: MouseButton) {
    return this.buttons.isPressed(button);
  }

  setPressed(button: MouseButton, pressed: boolean) {
    this.buttons.setPressed(button, pressed);
  }
}
