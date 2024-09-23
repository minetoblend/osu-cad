import type { InputState } from '../state/InputState.ts';
import type { IInput } from './IInput.ts';
import type { IInputStateChangeHandler } from './IInputStateChangeHandler.ts';
import { DropStateChangeEvent } from './events/DropStateChangeEvent.ts';

export class FileDropInput implements IInput {
  constructor(readonly files: FileList) {}

  apply(state: InputState, handler: IInputStateChangeHandler) {
    state.draggedFiles = this.files;
    handler.handleInputStateChange(new DropStateChangeEvent(state, this));
  }
}
