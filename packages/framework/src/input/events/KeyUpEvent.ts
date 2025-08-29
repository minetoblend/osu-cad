import type { InputState } from "../state/InputState";
import type { Key } from "../state/Key";
import { UIEvent } from "./UIEvent";

export class KeyUpEvent extends UIEvent
{
  public constructor(
    state: InputState,
    public readonly key: Key,
  )
  {
    super(state, "onKeyUp");
  }

  public override toString(): string
  {
    return `KeyDownEvent(${this.key})`;
  }
}
