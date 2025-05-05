import type { InputState } from "../state/InputState";
import { UIEvent } from "./UIEvent";

export class HoverEvent extends UIEvent
{
  constructor(state: InputState)
  {
    super(state, "onHover");
  }
}
