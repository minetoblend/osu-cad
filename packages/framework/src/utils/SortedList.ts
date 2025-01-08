import type { IComparer } from './IComparer';

export class SortedList<T> {
  #items: T[] = [];

  constructor(private readonly comparer: IComparer<T>) {
  }

  get length() {
    return this.#items.length;
  }

  get(index: number): T | undefined {
    return this.#items[index];
  }

  set(index: number, item: T) {
    this.#items[index] = item;
  }

  add(item: T): number {
    return this.#addInternal(item);
  }

  addRange(items: readonly T[]) {
    for (const item of items) {
      this.add(item);
    }
  }

  #addInternal(item: T) {
    // It happens quite regularly that we're adding items to the end/start of the list, so we're checking for that first before we do a binary search
    if (this.#items.length > 0) {
      if (this.comparer.compare(item, this.#items[0]) < 0) {
        this.#items.unshift(item);
        return 0;
      }

      if (this.comparer.compare(item, this.#items[this.#items.length - 1]) > 0) {
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

  remove(item: T) {
    // Items often get removed right from the start/end, so we're checking for those first before we look at the rest of the array
    if (item === this.#items[0]) {
      this.#items.shift();
      return true;
    }

    if (item === this.#items[this.#items.length - 1]) {
      this.#items.pop();
      return true;
    }

    let index = this.binarySearch(item);

    if (index < 0)
      return false;

    if (item === this.#items[index]) {
      this.removeAt(index);
      return true;
    }

    index = this.#items.indexOf(item);

    if (index < 0)
      return false;

    this.removeAt(index);

    return true;
  }

  removeAt(index: number) {
    this.#items.splice(index, 1);
  }

  removeAll(match: (item: T) => boolean) {
    this.#items = this.#items.filter(item => !match(item));
  }

  clear() {
    this.#items.length = 0;
  }

  includes(item: T) {
    return this.#items.includes(item);
  }

  binarySearch(item: T) {
    let left = 0;
    let right = this.#items.length - 1;

    while (left <= right) {
      const middle = left + ((right - left) >> 1);
      const compare = this.comparer.compare(this.#items[middle], item);

      if (compare < 0) {
        left = middle + 1;
      }
      else if (compare > 0) {
        right = middle - 1;
      }
      else {
        return middle;
      }
    }

    return ~left;
  }

  find(predicate: (value: T, index: number, obj: T[]) => unknown): T | undefined {
    return this.#items.find(predicate);
  }

  filter(predicate: (value: T, index: number, obj: T[]) => unknown): T[] {
    return this.#items.filter(predicate);
  }

  findLast(predicate: (value: T, index: number, obj: T[]) => unknown): T | undefined {
    for (let i = this.#items.length - 1; i >= 0; i--) {
      if (predicate(this.#items[i]!, i, this.#items as T[]))
        return this.#items[i];
    }

    return undefined;
  }

  findIndex(predicate: (value: T, index: number, obj: T[]) => unknown): number {
    return this.#items.findIndex(predicate);
  }

  sort() {
    this.#items.sort(this.comparer.compare);
  }

  indexOf(item: T) {
    return this.binarySearch(item);
  }

  get first(): T | undefined {
    return this.#items[0];
  }

  get last(): T | undefined {
    return this.#items[this.#items.length - 1];
  }

  [Symbol.iterator]() {
    return this.#items[Symbol.iterator]();
  }

  get items(): ReadonlyArray<T> {
    return this.#items;
  }
}
