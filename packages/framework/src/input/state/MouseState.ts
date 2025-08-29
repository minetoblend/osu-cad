import type { IInput } from "../stateChanges/IInput";
import type { MouseButton } from "./MouseButton";
import { Vec2 } from "../../math";
import { ButtonStates } from "./ButtonStates";

export class MouseState
{
  public readonly buttons = new ButtonStates<MouseButton>();

  public position = new Vec2();

  public isPositionValid = false;

  public scroll = new Vec2();

  public pressure = 1;

  public lastSource?: IInput;

  public isPressed(button: MouseButton)
  {
    return this.buttons.isPressed(button);
  }

  public setPressed(button: MouseButton, pressed: boolean)
  {
    this.buttons.setPressed(button, pressed);
  }
}
