import type { Drawable } from "../../graphics";
import type { InputState } from "../state/InputState";
import { UIEvent } from "./UIEvent";

export class FocusLostEvent extends UIEvent
{
  constructor(
    state: InputState,
    readonly nextFocused: Drawable | null,
  )
  {
    super(state, "onFocusLost");
  }
}
