export class Lazy<T>
{
  constructor(loader: () => T)
  {
    this.#loader = loader;
  }

  readonly #loader: () => T;

  #value?: T;

  get value(): T
  {
    this.#value ??= this.#loader();

    return this.#value;
  }
}
