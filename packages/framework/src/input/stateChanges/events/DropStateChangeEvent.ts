import type { InputState } from '../../state/InputState';
import type { FileDropInput } from '../FileDropInput';
import { InputStateChangeEvent } from './InputStateChangeEvent';

export class DropStateChangeEvent extends InputStateChangeEvent {
  constructor(state: InputState, input: FileDropInput) {
    super(state, input);

    this.files = input.files;
  }

  readonly files: FileList;
}
