import type { GameHost } from '../../platform/GameHost';
import type { IDisposable } from '../../types/IDisposable';
import type { IInput } from '../stateChanges/IInput';
import { Bindable } from '../../bindables/Bindable';

export abstract class InputHandler implements IDisposable {
  #isInitialized = false;

  initialize(host: GameHost): boolean {
    if (this.#isInitialized) {
      throw new Error('InputHandler is already initialized');
    }

    this.#isInitialized = true;
    return true;
  }

  readonly enabled = new Bindable(true);

  #isDisposed: boolean = false;

  protected pendingInputs: IInput[] = [];

  get isDisposed() {
    return this.#isDisposed;
  }

  dispose(isDisposing: boolean = true): void {
    this.#isDisposed = true;
  }

  collectPendingInputs(inputs: IInput[]): void {
    inputs.push(...this.pendingInputs);
    this.pendingInputs.length = 0;
  }
}
