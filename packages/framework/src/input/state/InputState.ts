import { KeyboardState } from "./KeyboardState";
import { MouseState } from "./MouseState";
import { TouchState } from "./TouchState";

export class InputState
{
  public readonly mouse = new MouseState();
  public readonly keyboard = new KeyboardState();
  public readonly touch = new TouchState();

  public draggedFiles: FileList | null = null;

  public constructor(
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
