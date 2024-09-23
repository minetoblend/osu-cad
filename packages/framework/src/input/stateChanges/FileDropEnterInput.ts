import type { InputState } from '../state/InputState.ts';
import type { IInput } from './IInput.ts';

export class FileDropEnterInput implements IInput {
  constructor(readonly files: FileList | null) {}

  apply(state: InputState) {
    state.draggedFiles = this.files;
  }
}
