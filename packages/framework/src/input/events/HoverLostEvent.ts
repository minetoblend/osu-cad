import type { InputState } from "../state/InputState";
import { UIEvent } from "./UIEvent";

export class HoverLostEvent extends UIEvent 
{
  constructor(state: InputState) 
  {
    super(state, "onHoverLost");
  }
}
