import type { ButtonStates } from "../state/ButtonStates";
import type { InputState } from "../state/InputState";
import type { MouseButton } from "../state/MouseButton";
import type { IInputStateChangeHandler } from "./IInputStateChangeHandler";
import { ButtonInput, ButtonInputEntry } from "./ButtonInput";

export class MouseButtonInput extends ButtonInput<MouseButton>
{
  public constructor(entries: ButtonInputEntry<MouseButton>[])
  {
    super(entries);
  }

  public static create(button: MouseButton, isPressed: boolean): MouseButtonInput
  {
    return new MouseButtonInput([new ButtonInputEntry(button, isPressed)]);
  }

  protected override getButtonStates(state: InputState): ButtonStates<MouseButton>
  {
    return state.mouse.buttons;
  }

  public override apply(state: InputState, handler: IInputStateChangeHandler)
  {
    super.apply(state, handler);
    state.mouse.lastSource = this;
  }
}
