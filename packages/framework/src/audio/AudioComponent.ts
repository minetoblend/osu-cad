import type { IAudioComponent } from "./IAudioComponent";

export abstract class AudioComponent implements IAudioComponent
{
  protected constructor(public readonly name: string)
  {
  }

  public update()
  {
    if (this.isDisposed)
      throw new Error(`Disposed AudioComponent ${this.constructor.name}`);

    this.updateState();
    this.updateChildren();
  }

  protected updateState()
  {
  }

  protected updateChildren()
  {
  }

  public get isLoaded()
  {
    return true;
  }

  public get hasCompleted()
  {
    return !this.isAlive;
  }

  public get isAlive()
  {
    return !this.isDisposed;
  }

  #isDisposed = false;

  public get isDisposed()
  {
    return this.#isDisposed;
  }

  public dispose()
  {
    this.#isDisposed = true;
  }
}
