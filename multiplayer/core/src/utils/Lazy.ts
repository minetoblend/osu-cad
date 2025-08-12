export class Lazy<T>
{
  constructor(readonly compute: () => T)
  {
  }

  #value?: T;

  get value(): T
  {
    if (this.#value === undefined)
      this.#value = this.compute();

    return this.#value;
  }
}
