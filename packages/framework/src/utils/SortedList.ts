import type { IComparer } from "./IComparer";

export class SortedList<T>
{
  #items: T[] = [];

  public constructor(private readonly comparer: IComparer<T>)
  {
  }

  public get length()
  {
    return this.#items.length;
  }

  public get(index: number): T | undefined
  {
    return this.#items[index];
  }

  public set(index: number, item: T)
  {
    this.#items[index] = item;
  }

  public add(item: T): number
  {
    return this.#addInternal(item);
  }

  public addRange(items: readonly T[])
  {
    for (const item of items)
    {
      this.add(item);
    }
  }

  #addInternal(item: T)
  {
    // It happens quite regularly that we're adding items to the end/start of the list, so we're checking for that first before we do a binary search
    if (this.#items.length > 0)
    {
      if (this.comparer.compare(item, this.#items[0]) < 0)
      {
        this.#items.unshift(item);
        return 0;
      }

      if (this.comparer.compare(item, this.#items[this.#items.length - 1]) > 0)
      {
        this.#items.push(item);
        return this.#items.length - 1;
      }
    }

    let index = this.binarySearch(item);
    if (index < 0)
      index = ~index;

    this.#items.splice(index, 0, item);

    return index;
  }

  public remove(item: T)
  {
    // Items often get removed right from the start/end, so we're checking for those first before we look at the rest of the array
    if (item === this.#items[0])
    {
      this.#items.shift();
      return true;
    }

    if (item === this.#items[this.#items.length - 1])
    {
      this.#items.pop();
      return true;
    }

    let index = this.binarySearch(item);

    if (index < 0)
      return false;

    if (item === this.#items[index])
    {
      this.removeAt(index);
      return true;
    }

    index = this.#items.indexOf(item);

    if (index < 0)
      return false;

    this.removeAt(index);

    return true;
  }

  public removeAt(index: number)
  {
    this.#items.splice(index, 1);
  }

  public removeAll(match: (item: T) => boolean)
  {
    this.#items = this.#items.filter(item => !match(item));
  }

  public clear()
  {
    this.#items.length = 0;
  }

  public includes(item: T)
  {
    return this.#items.includes(item);
  }

  public binarySearch(item: T)
  {
    let left = 0;
    let right = this.#items.length - 1;

    while (left <= right)
    {
      const middle = left + ((right - left) >> 1);
      const compare = this.comparer.compare(this.#items[middle], item);

      if (compare < 0)
        left = middle + 1;
      else if (compare > 0)
        right = middle - 1;
      else
        return middle;
    }

    return ~left;
  }

  public find(predicate: (value: T, index: number, obj: T[]) => unknown): T | undefined
  {
    return this.#items.find(predicate);
  }

  public filter(predicate: (value: T, index: number, obj: T[]) => unknown): T[]
  {
    return this.#items.filter(predicate);
  }

  public findLast(predicate: (value: T, index: number, obj: T[]) => unknown): T | undefined
  {
    for (let i = this.#items.length - 1; i >= 0; i--)
    {
      if (predicate(this.#items[i]!, i, this.#items as T[]))
        return this.#items[i];
    }

    return undefined;
  }

  public findIndex(predicate: (value: T, index: number, obj: T[]) => unknown): number
  {
    return this.#items.findIndex(predicate);
  }

  public sort()
  {
    this.#items.sort(this.comparer.compare);
  }

  public indexOf(item: T)
  {
    return this.binarySearch(item);
  }

  public get first(): T | undefined
  {
    return this.#items[0];
  }

  public get last(): T | undefined
  {
    return this.#items[this.#items.length - 1];
  }

  public [Symbol.iterator]()
  {
    return this.#items[Symbol.iterator]();
  }

  public get items(): ReadonlyArray<T>
  {
    return this.#items;
  }
}
