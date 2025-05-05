import type { Vec2 } from "../../math/Vec2";
import type { Touch } from "../handlers/Touch";
import type { IInputReceiver } from "../IInputReceiver";
import type { InputState } from "../state/InputState";
import { UIEvent } from "./UIEvent";

export class TouchEvent extends UIEvent 
{
  constructor(state: InputState, handler: keyof IInputReceiver, touch: Touch, screenSpaceTouchDownPosition: Vec2 | null = null) 
  {
    super(state, handler);

    this.screenSpaceTouch = touch;
    this.screenSpaceTouchDownPosition = screenSpaceTouchDownPosition;
  }

  readonly screenSpaceTouch: Touch;

  readonly screenSpaceTouchDownPosition: Vec2 | null;

  isActive(touch: Touch) 
  {
    return this.state.touch.isActive(touch.source);
  }
}
