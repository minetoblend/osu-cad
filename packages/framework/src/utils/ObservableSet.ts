import { Action } from "../bindables";

export class ObservableSet<T>
{
  readonly #set = new Set<T>();

  readonly added = new Action<[T]>();

  readonly removed = new Action<[T]>();

  add(value: T): boolean
  {
    if (this.#set.has(value))
      return false;

    this.#set.add(value);
    this.added.emit(value);

    return true;
  }

  addRange(values: Iterable<T>)
  {
    for (const value of values)
      this.add(value);
  }

  remove(value: T): boolean
  {
    if (!this.#set.delete(value))
      return false;

    this.removed.emit(value);
    return true;
  }

  removeRange(values: Iterable<T>)
  {
    for (const value of values)
      this.remove(value);
  }

  toggle(value: T): boolean
  {
    if (this.has(value))
    {
      this.remove(value);
      return true;
    }

    this.add(value);
    return true;
  }

  clear(): void
  {
    const values = [...this.#set.values()];
    this.#set.clear();
    for (const value of values)
      this.removed.emit(value);
  }

  has(value: T): boolean
  {
    return this.#set.has(value);
  }

  get size(): number
  {
    return this.#set.size;
  }

  [Symbol.iterator]()
  {
    return this.#set.values();
  }
}
