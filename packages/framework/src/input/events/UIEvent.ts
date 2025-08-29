import type { Drawable } from "../../graphics";
import type { Vec2 } from "../../math";
import type { IInputReceiver } from "../IInputReceiver";
import type { InputState } from "../state/InputState";

export class UIEvent
{
  public constructor(
    public readonly state: InputState,
    public readonly handler: keyof IInputReceiver,
  )
  {}

  public target: Drawable | null = null;

  public get mousePosition(): Vec2
  {
    return this.target!.toLocalSpace(this.screenSpaceMousePosition);
  }

  public get screenSpaceMousePosition()
  {
    return this.state.mouse.position;
  }

  public get controlPressed()
  {
    return this.state.keyboard.controlPressed;
  }

  public get shiftPressed()
  {
    return this.state.keyboard.shiftPressed;
  }

  public get altPressed()
  {
    return this.state.keyboard.altPressed;
  }

  public get metaPressed()
  {
    return this.state.keyboard.metaPressed;
  }

  public get anyModifierPressed()
  {
    return this.controlPressed || this.shiftPressed || this.altPressed || this.metaPressed;
  }

  public get draggedFiles()
  {
    return this.state.draggedFiles;
  }

  public get touchCount()
  {
    return this.state.touch.activeSources.pressedButtons.size;
  }

  public get pressure()
  {
    return this.state.mouse.pressure;
  }

  public toString()
  {
    return this.constructor.name;
  }
}
