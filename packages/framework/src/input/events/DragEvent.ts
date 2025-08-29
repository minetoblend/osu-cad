import type { Drawable } from "../../graphics/drawables/Drawable";
import type { Vec2 } from "../../math";
import type { InputState } from "../state/InputState";
import type { MouseButton } from "../state/MouseButton";
import { UIEvent } from "./UIEvent";

export class DragEvent extends UIEvent
{
  public constructor(
    state: InputState,
    public readonly button: MouseButton,
    screenSpaceMouseDownPosition: Vec2 | null = null,
    screenSpaceLastMousePosition: Vec2 | null = null,
  )
  {
    super(state, "onDrag");
    this.screenSpaceLastMousePosition = screenSpaceLastMousePosition ?? state.mouse.position;
    this.screenSpaceMouseDownPosition = screenSpaceMouseDownPosition ?? state.mouse.position;
  }

  public readonly screenSpaceMouseDownPosition: Vec2;
  public readonly screenSpaceLastMousePosition: Vec2;

  public get delta()
  {
    return this.target!.parent!.toLocalSpace(this.screenSpaceMousePosition).sub(this.target!.parent!.toLocalSpace(this.screenSpaceLastMousePosition));
  }

  public get screenSpaceDelta(): Vec2
  {
    return this.screenSpaceMousePosition.sub(this.screenSpaceLastMousePosition);
  }

  public localSpaceDelta(drawable: Drawable): Vec2
  {
    const position = drawable.toLocalSpace(this.screenSpaceMousePosition);
    const lastPosition = drawable.toLocalSpace(this.screenSpaceLastMousePosition);

    return position.sub(lastPosition);
  }

  public parentSpaceDelta(drawable: Drawable): Vec2
  {
    const position = drawable.parent!.toLocalSpace(this.screenSpaceMousePosition);
    const lastPosition = drawable.parent!.toLocalSpace(this.screenSpaceLastMousePosition);

    return position.sub(lastPosition);
  }
}
