import type { InputState } from '../state/InputState';
import type { IInput } from './IInput';
import type { IInputStateChangeHandler } from './IInputStateChangeHandler';

export class PressureInput implements IInput {
  constructor(readonly pressure: number) {
  }

  apply(state: InputState, handler: IInputStateChangeHandler) {
    state.mouse.pressure = this.pressure;
  }
}
