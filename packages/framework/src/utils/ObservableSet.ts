import { Action } from "../bindables";

export class ObservableSet<T>
{
  readonly #set = new Set<T>();

  public readonly added = new Action<[T]>();

  public readonly removed = new Action<[T]>();

  public add(value: T): boolean
  {
    if (this.#set.has(value))
      return false;

    this.#set.add(value);
    this.added.emit(value);

    return true;
  }

  public addRange(values: Iterable<T>)
  {
    for (const value of values)
      this.add(value);
  }

  public remove(value: T): boolean
  {
    if (!this.#set.delete(value))
      return false;

    this.removed.emit(value);
    return true;
  }

  public removeRange(values: Iterable<T>)
  {
    for (const value of values)
      this.remove(value);
  }

  public toggle(value: T): boolean
  {
    if (this.has(value))
    {
      this.remove(value);
      return true;
    }

    this.add(value);
    return true;
  }

  public clear(): void
  {
    const values = [...this.#set.values()];
    this.#set.clear();
    for (const value of values)
      this.removed.emit(value);
  }

  public has(value: T): boolean
  {
    return this.#set.has(value);
  }

  public get size(): number
  {
    return this.#set.size;
  }

  public [Symbol.iterator]()
  {
    return this.#set.values();
  }
}
