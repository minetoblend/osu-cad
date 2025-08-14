export class AsyncLazy<T>
{
  constructor(fn: () => Promise<T>)
  {
    this.#fn = fn;
  }

  readonly #fn: () => Promise<T>;

  #valueP?: Promise<T>;

  get(): Promise<T>
  {
    return this.#valueP ??= this.#fn();
  }

  peek(): Promise<T> | undefined
  {
    return this.#valueP;
  }
}
