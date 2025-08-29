import type { InputState } from "../state/InputState";
import { UIEvent } from "./UIEvent";

export class HoverEvent extends UIEvent
{
  public constructor(state: InputState)
  {
    super(state, "onHover");
  }
}
