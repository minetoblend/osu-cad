import type { IComparer } from 'osucad-framework';
import type { Constructor } from '../utils/Constructor';
import { Action, SortedList } from 'osucad-framework';
import { AbstractCrdt } from './AbstractCrdt';

export type SortedListMutation<T extends AbstractCrdt<any>> =
  {
    op: 'add';
    value: T;
  }
  | {
    op: 'remove';
    id: string;
  };

export class SortedListCrdt<T extends AbstractCrdt<any>> extends AbstractCrdt<SortedListMutation<T>> {
  readonly #idMap = new Map<string, T>();

  readonly #list!: SortedList<T>;

  readonly added = new Action<T>();

  readonly removed = new Action<T>();

  readonly sorted = new Action();

  constructor(readonly comparer: IComparer<T>) {
    super();

    this.#list = new SortedList(comparer);
  }

  override handle(mutation: SortedListMutation<T>): void | SortedListMutation<T> | null {
    switch (mutation.op) {
      case 'add':
        if (this.#add(mutation.value)) {
          return {
            op: 'remove',
            id: mutation.value.id,
          };
        }

        return null;
      case 'remove': {
        const value = this.#idMap.get(mutation.id);
        if (value) {
          this.#remove(value);

          return {
            op: 'add',
            value,
          };
        }
      }
    }

    return null;
  }

  #add(value: T, attach: boolean = true): boolean {
    if (this.#idMap.has(value.id))
      return false;

    this.#list.add(value);

    if (attach) {
      this.#idMap.set(value.id, value);
      this.attachChild(value);
    }

    this.onAdded(value);

    return true;
  }

  #remove(value: T, detach: boolean = true): boolean {
    this.#idMap.delete(value.id);
    if (!this.#list.remove(value))
      return false;

    if (detach)
      value.detach();

    this.onRemoved(value);

    return true;
  }

  add(value: T) {
    if (!this.#add(value))
      return false;

    this.submitMutation({
      op: 'add',
      value,
    }, {
      op: 'remove',
      id: value.id,
    });

    return true;
  }

  addUntracked(value: T) {
    return this.#add(value, false);
  }

  removeUntracked(value: T) {
    return this.#remove(value, false);
  }

  remove(value: T) {
    if (!this.#remove(value))
      return false;

    this.submitMutation({
      op: 'remove',
      id: value.id,
    }, {
      op: 'add',
      value,
    });

    return true;
  }

  getById(id: string) {
    return this.#idMap.get(id) ?? null;
  }

  get items() {
    return this.#list.items;
  }

  protected onAdded(item: T) {
    this.added.emit(item);
  }

  protected onRemoved(item: T) {
    this.removed.emit(item);
  }

  sort() {
    this.#list.sort();
    this.sorted.emit();
  }

  override get childObjects(): readonly AbstractCrdt<any>[] {
    return this.items;
  }

  [Symbol.iterator]() {
    return this.#list[Symbol.iterator]();
  }

  get first() {
    return this.#list.first;
  }

  get last() {
    return this.#list.last;
  }

  filter(predicate: (value: T, index: number, array: readonly T[]) => boolean) {
    return this.items.filter(predicate);
  }

  ofType<U extends T>(type: Constructor<U>): U[] {
    return this.items.filter(it => it instanceof type) as U[];
  }
}
