import type { IDisposable } from "./IDisposable";

export interface IUsable extends IDisposable
{
  [Symbol.dispose]: () => void;
}

export abstract class Usable implements IUsable
{
  abstract dispose(): void;

  [Symbol.dispose](): void
  {
    this.dispose();
  }
}

export class ValueInvokeOnDisposal extends Usable
{
  constructor(dispose: () => void)
  {
    super();
    this.#dispose = dispose;
  }

  readonly #dispose: () => void;

  dispose()
  {
    this.#dispose();
  }
}
