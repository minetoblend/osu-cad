import type { Drawable } from "../../graphics";
import type { InputState } from "../state/InputState";
import { UIEvent } from "./UIEvent";

export class FocusLostEvent extends UIEvent
{
  public constructor(
    state: InputState,
    public readonly nextFocused: Drawable | null,
  )
  {
    super(state, "onFocusLost");
  }
}
