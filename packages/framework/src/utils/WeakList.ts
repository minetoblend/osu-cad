export class WeakList<T extends object | any[]> implements Iterable<T> {
  #items: WeakRef<T>[];

  get length() {
    return this.#items.length;
  }

  constructor(items?: T[]) {
    this.#items = items ? items.map(it => new WeakRef(it)) : [];
  }

  includes(item: T) {
    for (const it of this) {
      if (item === it)
        return true;
    }
    return false;
  }

  add(item: T | WeakRef<T>) {
    if (!(item instanceof WeakRef)) {
      item = new WeakRef(item);
    }

    return this.#items.push(item as WeakRef<T>);
  }

  remove(item: T) {
    const index = this.#items.findIndex(it => it.deref() === item);
    if (index >= 0) {
      this.#items.splice(index, 1);
      return true;
    }

    return false;
  }

  clear() {
    this.#items = [];
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0;
    return {
      next: () => {
        while (index < this.length) {
          const value = this.#items[index].deref();

          if (value === undefined) {
            this.#items.splice(index, 1);
            continue;
          }

          index++;

          return {
            done: false,
            value,
          };
        }

        return {
          done: true,
          value: undefined,
        };
      },
    };
  }
}
