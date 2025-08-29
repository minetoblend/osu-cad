import type { IDisposable } from "./IDisposable";

export interface IUsable extends IDisposable
{
  [Symbol.dispose]: () => void;
}

export abstract class Usable implements IUsable
{
  public abstract dispose(): void;

  public [Symbol.dispose](): void
  {
    this.dispose();
  }
}

export class ValueInvokeOnDisposal extends Usable
{
  public constructor(dispose: () => void)
  {
    super();
    this.#dispose = dispose;
  }

  readonly #dispose: () => void;

  public dispose()
  {
    this.#dispose();
  }
}
