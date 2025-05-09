import { KeyboardState } from "./KeyboardState";
import { MouseState } from "./MouseState";
import { TouchState } from "./TouchState";

export class InputState
{
  readonly mouse = new MouseState();
  readonly keyboard = new KeyboardState();
  readonly touch = new TouchState();

  draggedFiles: FileList | null = null;

  constructor(
    other?: InputState,
  )
  {
    if (other)
    {
      this.mouse = other.mouse;
      this.keyboard = other.keyboard;
      this.touch = other.touch;
    }
  }
}
