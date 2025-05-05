import type { Drawable } from "../graphics/drawables/Drawable";
import type { List } from "../utils";
import type { InputState } from "./state/InputState";
import type { Key } from "./state/Key";
import { ButtonEventManager } from "./ButtonEventManager";
import { KeyDownEvent } from "./events/KeyDownEvent";
import { KeyUpEvent } from "./events/KeyUpEvent";

export class KeyEventManager extends ButtonEventManager<Key> 
{
  public handleRepeat(state: InputState) 
  {
    const inputQueue = new Set(this.getInputQueue());

    const drawables = this.buttonDownInputQueue!.filter(drawable => inputQueue.has(drawable));

    this.propagateButtonEvent(drawables, new KeyDownEvent(state, this.button, true));
  }

  handleButtonDown(state: InputState, targets: List<Drawable>): Drawable | null 
  {
    return this.propagateButtonEvent(targets, new KeyDownEvent(state, this.button));
  }

  handleButtonUp(state: InputState, targets: Drawable[]): void 
  {
    this.propagateButtonEvent(targets, new KeyUpEvent(state, this.button));
  }
}
