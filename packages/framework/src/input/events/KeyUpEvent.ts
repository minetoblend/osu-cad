import type { InputState } from "../state/InputState";
import type { Key } from "../state/Key";
import { UIEvent } from "./UIEvent";

export class KeyUpEvent extends UIEvent 
{
  constructor(
    state: InputState,
    readonly key: Key,
  ) 
  {
    super(state, "onKeyUp");
  }

  override toString(): string 
  {
    return `${super.toString()} (${this.key})`;
  }
}
