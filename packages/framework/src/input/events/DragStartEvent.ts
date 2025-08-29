import type { Vec2 } from "../../math";
import type { InputState } from "../state/InputState";
import type { MouseButton } from "../state/MouseButton";
import { UIEvent } from "./UIEvent";

export class DragStartEvent extends UIEvent
{
  public constructor(
    state: InputState,
    public readonly button: MouseButton,
    public readonly screenSpaceMouseDownPosition: Vec2 | null = null,
  )
  {
    super(state, "onDragStart");
  }

  public get delta()
  {
    return this.state.mouse.position.sub(this.screenSpaceMouseDownPosition ?? this.state.mouse.position);
  }

  public get mouseDownPosition()
  {
    return this.target!.toLocalSpace(this.screenSpaceMouseDownPosition ?? this.screenSpaceMousePosition);
  }
}
