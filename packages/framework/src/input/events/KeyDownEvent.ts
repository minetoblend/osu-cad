import type { InputState } from "../state/InputState";
import type { Key } from "../state/Key";
import { UIEvent } from "./UIEvent";

export class KeyDownEvent extends UIEvent
{
  public constructor(
    state: InputState,
    public readonly key: Key,
    public readonly repeat: boolean = false,
  )
  {
    super(state, "onKeyDown");
  }

  public override toString(): string
  {
    return `KeyDownEvent(${this.key})`;
  }
}
