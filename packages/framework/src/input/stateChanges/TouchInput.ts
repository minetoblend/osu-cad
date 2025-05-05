import type { Touch } from "../handlers/Touch";
import type { InputState } from "../state/InputState";
import type { IInput } from "./IInput";
import type { IInputStateChangeHandler } from "./IInputStateChangeHandler";
import { TouchStateChangeEvent } from "./events/TouchStateChangeEvent";

export class TouchInput implements IInput 
{
  constructor(
    readonly touches: Touch[],
    readonly activate: boolean,
  ) 
  {}

  apply(state: InputState, handler: IInputStateChangeHandler): void 
  {
    const touches = state.touch;

    for (const touch of this.touches) 
    {
      const lastPosition = touches.getTouchPosition(touch.source);
      touches.touchPositions[touch.source] = touch.position;

      const activityChanged = touches.activeSources.setPressed(touch.source, this.activate);
      const positionChanged = lastPosition !== null && !touch.position.equals(lastPosition);

      if (activityChanged || positionChanged) 
      {
        handler.handleInputStateChange(
            new TouchStateChangeEvent(
                state,
                this,
                touch,
            !activityChanged ? null : this.activate,
            !positionChanged ? null : lastPosition,
            ),
        );
      }
    }
  }
}
