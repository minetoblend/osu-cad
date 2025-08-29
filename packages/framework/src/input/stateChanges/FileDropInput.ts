import type { InputState } from "../state/InputState";
import type { IInput } from "./IInput";
import type { IInputStateChangeHandler } from "./IInputStateChangeHandler";
import { DropStateChangeEvent } from "./events/DropStateChangeEvent";

export class FileDropInput implements IInput
{
  public constructor(public readonly files: FileList)
  {}

  public apply(state: InputState, handler: IInputStateChangeHandler)
  {
    state.draggedFiles = this.files;
    handler.handleInputStateChange(new DropStateChangeEvent(state, this));
  }
}
