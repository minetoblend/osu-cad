import type { Vec2 } from "../../math/Vec2";
import type { Touch } from "../handlers/Touch";
import type { IInputReceiver } from "../IInputReceiver";
import type { InputState } from "../state/InputState";
import { UIEvent } from "./UIEvent";

export class TouchEvent extends UIEvent
{
  public constructor(state: InputState, handler: keyof IInputReceiver, touch: Touch, screenSpaceTouchDownPosition: Vec2 | null = null)
  {
    super(state, handler);

    this.screenSpaceTouch = touch;
    this.screenSpaceTouchDownPosition = screenSpaceTouchDownPosition;
  }

  public readonly screenSpaceTouch: Touch;

  public readonly screenSpaceTouchDownPosition: Vec2 | null;

  public isActive(touch: Touch)
  {
    return this.state.touch.isActive(touch.source);
  }
}
