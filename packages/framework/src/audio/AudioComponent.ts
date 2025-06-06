import type { IAudioComponent } from "./IAudioComponent";

export abstract class AudioComponent implements IAudioComponent
{
  protected constructor(readonly name: string)
  {
  }

  update()
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

  get isLoaded()
  {
    return true;
  }

  get hasCompleted()
  {
    return !this.isAlive;
  }

  get isAlive()
  {
    return !this.isDisposed;
  }

  #isDisposed = false;

  get isDisposed()
  {
    return this.#isDisposed;
  }

  dispose()
  {
    this.#isDisposed = true;
  }
}
