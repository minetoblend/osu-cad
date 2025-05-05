import type { InputState } from "../state/InputState";
import type { IInputStateChangeHandler } from "./IInputStateChangeHandler";

export interface IInput 
{
  apply: (state: InputState, handler: IInputStateChangeHandler) => void;
}
