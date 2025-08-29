import type { InputState } from "../state/InputState";
import type { IInput } from "./IInput";

export class FileDropEnterInput implements IInput
{
  public constructor(public readonly files: FileList | null)
  {}

  public apply(state: InputState)
  {
    state.draggedFiles = this.files;
  }
}
