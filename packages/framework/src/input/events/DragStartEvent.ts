import type { Vec2 } from "../../math";
import type { InputState } from "../state/InputState";
import type { MouseButton } from "../state/MouseButton";
import { UIEvent } from "./UIEvent";

export class DragStartEvent extends UIEvent 
{
  constructor(
    state: InputState,
    readonly button: MouseButton,
    readonly screenSpaceMouseDownPosition: Vec2 | null = null,
  ) 
  {
    super(state, "onDragStart");
  }

  get delta() 
  {
    return this.state.mouse.position.sub(this.screenSpaceMouseDownPosition ?? this.state.mouse.position);
  }

  get mouseDownPosition() 
  {
    return this.target!.toLocalSpace(this.screenSpaceMouseDownPosition ?? this.screenSpaceMousePosition);
  }
}
