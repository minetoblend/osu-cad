import type { InputState } from '../state/InputState.ts';
import { UIEvent } from './UIEvent';

export class DropEvent extends UIEvent {
  constructor(
    state: InputState,
    readonly files: FileList,
  ) {
    super(state, 'onDrop');
  }
}