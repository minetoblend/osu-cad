import type { InputHandler } from "./handlers/InputHandler";
import { InputManager } from "./InputManager";

export class CustomInputManager extends InputManager
{
  protected override inputHandlers: ReadonlyArray<InputHandler> = [];

  public addHandler(handler: InputHandler)
  {
    if (!handler.initialize(this.host))
      return;

    this.inputHandlers = [...this.inputHandlers, handler];
  }

  public removeHandler(handler: InputHandler)
  {
    this.inputHandlers = this.inputHandlers.filter(h => h !== handler);
  }

  public override dispose()
  {
    for (const handler of this.inputHandlers)
      handler.dispose();

    super.dispose();
  }
}
