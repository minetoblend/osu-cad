import type { InputState } from "../state/InputState";
import { UIEvent } from "./UIEvent";

export class DropEvent extends UIEvent
{
  public constructor(
    state: InputState,
    public readonly files: FileList,
  )
  {
    super(state, "onDrop");
  }
}
