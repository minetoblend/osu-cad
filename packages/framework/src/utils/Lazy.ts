export class Lazy<T>
{
  public constructor(loader: () => T)
  {
    this.#loader = loader;
  }

  readonly #loader: () => T;

  #value?: T;

  public get value(): T
  {
    this.#value ??= this.#loader();

    return this.#value;
  }
}
