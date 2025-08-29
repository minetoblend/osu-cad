export class Lazy<T>
{
  public constructor(public readonly compute: () => T)
  {
  }

  #value?: T;

  public get value(): T
  {
    if (this.#value === undefined)
      this.#value = this.compute();

    return this.#value;
  }
}
