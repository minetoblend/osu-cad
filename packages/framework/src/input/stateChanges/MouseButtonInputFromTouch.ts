import type { MouseButton } from "../state/MouseButton";
import type { TouchStateChangeEvent } from "./events/TouchStateChangeEvent";
import type { ISourcedFromTouch } from "./ISourcedFromTouch";
import { ButtonInputEntry } from "./ButtonInput";
import { MouseButtonInput } from "./MouseButtonInput";

export class MouseButtonInputFromTouch extends MouseButtonInput implements ISourcedFromTouch
{
  public constructor(
    button: MouseButton,
    isPressed: boolean,
    public readonly touchEvent: TouchStateChangeEvent,
  )
  {
    super([new ButtonInputEntry(button, isPressed)]);
  }

  public readonly sourcedFromTouch = true;
}
