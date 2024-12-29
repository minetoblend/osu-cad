import type { InputState } from '../state/InputState';
import type { IInput } from './IInput';

export class FileDropEnterInput implements IInput {
  constructor(readonly files: FileList | null) {}

  apply(state: InputState) {
    state.draggedFiles = this.files;
  }
}
