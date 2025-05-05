import type { InputHandler } from "./handlers/InputHandler";
import { InputManager } from "./InputManager";

export class UserInputManager extends InputManager
{
  get inputHandlers(): ReadonlyArray<InputHandler>
  {
    return this.host.availableInputHandlers;
  }
}
