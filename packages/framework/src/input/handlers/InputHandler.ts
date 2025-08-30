import type { GameHost } from "../../platform/GameHost";
import type { IDisposable } from "../../types/IDisposable";
import type { IInput } from "../stateChanges/IInput";
import { Action } from "../../bindables/Action";
import { Bindable } from "../../bindables/Bindable";

export abstract class InputHandler implements IDisposable
{
  #isInitialized = false;

  public initialize(host: GameHost): boolean
  {
    if (this.#isInitialized)
    {
      throw new Error("InputHandler is already initialized");
    }

    this.#isInitialized = true;
    return true;
  }

  public readonly enabled = new Bindable(true);

  #isDisposed: boolean = false;

  protected pendingInputs: IInput[] = [];

  public get isDisposed()
  {
    return this.#isDisposed;
  }

  public dispose(): void
  {
    this.#isDisposed = true;
  }

  public collectPendingInputs(inputs: IInput[]): void
  {
    inputs.push(...this.pendingInputs);
    this.pendingInputs.length = 0;
  }

  public readonly flush = new Action();
}
