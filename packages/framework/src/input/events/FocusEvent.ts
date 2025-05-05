import type { Drawable } from "../../graphics";
import type { InputState } from "../state/InputState";
import { UIEvent } from "./UIEvent";

export class FocusEvent extends UIEvent 
{
  constructor(
    state: InputState,
    readonly previouslyFocused: Drawable | null,
  ) 
  {
    super(state, "onFocus");
  }
}
