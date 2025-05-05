import { ButtonStates } from "./ButtonStates";
import { Key } from "./Key";

export class KeyboardState
{
  readonly keys = new ButtonStates<Key>();

  get controlPressed()
  {
    return this.keys.isPressed(Key.ControlLeft) || this.keys.isPressed(Key.ControlRight);
  }

  get shiftPressed()
  {
    return this.keys.isPressed(Key.ShiftLeft) || this.keys.isPressed(Key.ShiftRight);
  }

  get altPressed()
  {
    return this.keys.isPressed(Key.AltLeft) || this.keys.isPressed(Key.AltRight);
  }

  get metaPressed()
  {
    return this.keys.isPressed(Key.MetaLeft) || this.keys.isPressed(Key.MetaRight);
  }
}
