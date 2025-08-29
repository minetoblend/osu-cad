import { ButtonStates } from "./ButtonStates";
import { Key } from "./Key";

export class KeyboardState
{
  public readonly keys = new ButtonStates<Key>();

  public get controlPressed()
  {
    return this.keys.isPressed(Key.ControlLeft) || this.keys.isPressed(Key.ControlRight);
  }

  public get shiftPressed()
  {
    return this.keys.isPressed(Key.ShiftLeft) || this.keys.isPressed(Key.ShiftRight);
  }

  public get altPressed()
  {
    return this.keys.isPressed(Key.AltLeft) || this.keys.isPressed(Key.AltRight);
  }

  public get metaPressed()
  {
    return this.keys.isPressed(Key.MetaLeft) || this.keys.isPressed(Key.MetaRight);
  }
}
