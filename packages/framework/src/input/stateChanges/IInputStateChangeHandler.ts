import type { InputStateChangeEvent } from './events/InputStateChangeEvent';

export interface IInputStateChangeHandler {
  handleInputStateChange: (event: InputStateChangeEvent) => void;
}
