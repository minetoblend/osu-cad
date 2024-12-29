import type { InputHandler } from './handlers/InputHandler';
import { InputManager } from './InputManager';

export class CustomInputManager extends InputManager {
  override inputHandlers: ReadonlyArray<InputHandler> = [];

  addHandler(handler: InputHandler) {
    if (!handler.initialize(this.host))
      return;

    this.inputHandlers = [...this.inputHandlers, handler];
  }

  removeHandler(handler: InputHandler) {
    this.inputHandlers = this.inputHandlers.filter(h => h !== handler);
  }

  override dispose(isDisposing: boolean = true) {
    for (const handler of this.inputHandlers) {
      handler.dispose();
    }

    super.dispose(isDisposing);
  }
}
