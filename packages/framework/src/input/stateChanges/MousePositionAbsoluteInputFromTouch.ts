import type { Vec2 } from "../../math";
import type { TouchStateChangeEvent } from "./events/TouchStateChangeEvent";
import type { ISourcedFromTouch } from "./ISourcedFromTouch";
import { MousePositionAbsoluteInput } from "./MousePositionAbsoluteInput";

export class MousePositionAbsoluteInputFromTouch extends MousePositionAbsoluteInput implements ISourcedFromTouch
{
  constructor(
    readonly touchEvent: TouchStateChangeEvent,
    position: Vec2,
  )
  {
    super(position);
  }

  readonly sourcedFromTouch = true;
}
