import type { GameHost } from "../../platform/GameHost";
import type { IInput } from "../stateChanges/IInput";
import { InputHandler } from "./InputHandler";

export class ManualInputHandler extends InputHandler
{
  override initialize(host: GameHost): boolean
  {
    return super.initialize(host);
  }

  enqueueInput(input: IInput)
  {
    this.pendingInputs.push(input);
  }
}
