export class List<T> implements Iterable<T>
{
  #items: (T | undefined)[];

  #length = 0;

  readonly #initialCapacity: number;

  public constructor(capacity: number)
  {
    this.#items = Array.from({ length: capacity });
    this.#initialCapacity = capacity;
  }

  public get(index: number): T | undefined
  {
    return this.#items[index];
  }

  public get length(): number
  {
    return this.#length;
  }

  public get capacity()
  {
    return this.#items.length;
  }

  public ensureCapacity(capacity: number)
  {
    if (this.capacity < capacity)
    {
      this.#items.length = capacity;
    }
  }

  public get last(): T | undefined
  {
    return this.#items[this.#length - 1];
  }

  public get first(): T | undefined
  {
    return this.#items[0];
  }

  public push(item: T)
  {
    if (this.capacity < this.#length + 1)
    {
      this.#items.length = this.#items.length * 2;
    }

    this.#items[this.#length++] = item;
  }

  public pushAll(item: T[])
  {
    if (this.capacity < this.#length + item.length)
    {
      this.#items.length = this.#length * 2;
    }

    for (const i of item)
    {
      this.#items[this.#length++] = i;
    }
  }

  public pop(): T | undefined
  {
    if (this.#length === 0)
      return undefined;

    const item = this.#items[--this.#length];

    if (this.#length < this.capacity / 2)
    {
      this.#items.length = this.#length;
    }

    return item;
  }

  public clear()
  {
    this.#items.length = this.#initialCapacity;
    this.#length = 0;

    for (let i = 0; i < this.#items.length; i++)
    {
      this.#items[i] = undefined;
    }
  }

  public reverse()
  {
    const items = this.#items;
    let left: number | undefined;
    let right: number | undefined;
    const length = this.#length;
    for (left = 0, right = length - 1; left < right; left += 1, right -= 1)
    {
      const temporary = items[left];
      items[left] = items[right];
      items[right] = temporary;
    }
  }

  public indexOf(item: T): number
  {
    for (let i = 0; i < this.#length; i++)
    {
      if (this.#items[i] === item)
        return i;
    }

    return -1;
  }

  public contains(item: T): boolean
  {
    return this.#items.includes(item);
  }

  public splice(start: number, deleteCount: number, ...items: T[]): T[]
  {
    deleteCount = Math.min(deleteCount, this.#length - start);

    const deletedItems = this.#items.splice(start, deleteCount, ...items);
    this.#length += items.length - deleteCount;

    return deletedItems as T[];
  }

  public remove(item: T): boolean
  {
    const index = this.indexOf(item);
    if (index === -1)
      return false;

    this.splice(index, 1);
    return true;
  }

  public removeAll(predicate: (value: T, index: number, obj: T[]) => unknown): T[]
  {
    const removedItems: T[] = [];
    for (let i = 0; i < this.#length; i++)
    {
      if (predicate(this.#items[i]!, i, this.#items as T[]))
      {
        removedItems.push(this.#items[i]!);
        this.splice(i, 1);
        i--;
      }
    }

    return removedItems;
  }

  public find(predicate: (value: T, index: number, obj: T[]) => unknown): T | undefined
  {
    for (let i = 0; i < this.#length; i++)
    {
      if (predicate(this.#items[i]!, i, this.#items as T[]))
        return this.#items[i];
    }

    return undefined;
  }

  public filter(predicate: (value: T, index: number, obj: T[]) => unknown): T[]
  {
    const result: T[] = [];
    for (let i = 0; i < this.#length; i++)
    {
      if (predicate(this.#items[i]!, i, this.#items as T[]))
        result.push(this.#items[i]!);
    }

    return result;
  }

  public [Symbol.iterator](): Iterator<T>
  {
    let index = 0;
    return {
      next: () =>
      {
        if (index >= this.#length)
        {
          return {
            done: true,
            value: undefined,
          };
        }

        return {
          done: false,
          value: this.#items[index++]!,
        };
      },
    };
  }

  public get array(): T[]
  {
    return this.#items.slice(0, this.#length) as T[];
  }
}
