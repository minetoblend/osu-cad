import type { Vec2 } from "../../math";
import type { InputState } from "../state/InputState";
import { UIEvent } from "./UIEvent";

export class ScrollEvent extends UIEvent
{
  public constructor(
    state: InputState,
    public readonly scrollDelta: Vec2,
    public readonly isPrecise: boolean = false,
  )
  {
    super(state, "onScroll");
  }
}
