import type { ButtonStates } from "../state/ButtonStates";
import type { InputState } from "../state/InputState";
import type { IInput } from "./IInput";
import type { IInputStateChangeHandler } from "./IInputStateChangeHandler";
import { ButtonStateChangeEvent } from "./events/ButtonStateChangeEvent";
import { ButtonStateChangeKind } from "./events/ButtonStateChangeKind";

export abstract class ButtonInput<TButton> implements IInput
{
  constructor(public readonly entries: ButtonInputEntry<TButton>[])
  {}

  protected abstract getButtonStates(state: InputState): ButtonStates<TButton>;

  protected createEvent(
    state: InputState,
    button: TButton,
    kind: ButtonStateChangeKind,
  ): ButtonStateChangeEvent<TButton>
  {
    return new ButtonStateChangeEvent<TButton>(state, this, button, kind);
  }

  apply(state: InputState, handler: IInputStateChangeHandler): void
  {
    const buttonStates = this.getButtonStates(state);

    for (const entry of this.entries)
    {
      if (buttonStates.setPressed(entry.button, entry.isPressed))
      {
        const buttonStateChange = this.createEvent(
            state,
            entry.button,
          entry.isPressed ? ButtonStateChangeKind.Pressed : ButtonStateChangeKind.Released,
        );
        handler.handleInputStateChange(buttonStateChange);
      }
    }
  }
}

export class ButtonInputEntry<TButton>
{
  constructor(
    public button: TButton,
    public isPressed: boolean,
  )
  {}
}
