import type { Vec2 } from "../../math";
import type { TouchStateChangeEvent } from "./events/TouchStateChangeEvent";
import type { ISourcedFromTouch } from "./ISourcedFromTouch";
import { MousePositionAbsoluteInput } from "./MousePositionAbsoluteInput";

export class MousePositionAbsoluteInputFromTouch extends MousePositionAbsoluteInput implements ISourcedFromTouch
{
  public constructor(
    public readonly touchEvent: TouchStateChangeEvent,
    position: Vec2,
  )
  {
    super(position);
  }

  public readonly sourcedFromTouch = true;
}
