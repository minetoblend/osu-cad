import type { GameHost } from "../../platform/GameHost";
import type { IInput } from "../stateChanges/IInput";
import { InputHandler } from "./InputHandler";

export class ManualInputHandler extends InputHandler
{
  public override initialize(host: GameHost): boolean
  {
    return super.initialize(host);
  }

  public enqueueInput(input: IInput)
  {
    this.pendingInputs.push(input);
  }
}
