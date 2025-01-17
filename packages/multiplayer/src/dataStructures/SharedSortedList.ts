import type { IComparer } from '@osucad/framework';
import type { ISummary } from './ISummary';
import type { MutationContext } from './MutationContext';
import type { ObjectSummary } from './SharedObject';
import { Action, SortedList } from '@osucad/framework';
import { SharedStructure } from './SharedStructure';

export type SortedListMutation =
  {
    op: 'add';
    value: ObjectSummary;
  }
  | {
    op: 'remove';
    id: string;
  };

export interface SortedListSummary extends ISummary {
  items: any[];
}

export abstract class SharedSortedList<T extends SharedStructure<any>> extends SharedStructure<SortedListMutation, SortedListSummary> {
  readonly #idMap = new Map<string, T>();

  readonly #list!: SortedList<T>;

  readonly added = new Action<T>();

  readonly removed = new Action<T>();

  readonly sorted = new Action();

  protected constructor(readonly comparer: IComparer<T>) {
    super();

    this.#list = new SortedList(comparer);
  }

  get length() {
    return this.#list.length;
  }

  override handle(mutation: SortedListMutation, ctx: MutationContext): void | SortedListMutation | null {
    // TODO: handle id conflicts
    switch (mutation.op) {
      case 'add': {
        const value = this.createChildFromSummary(mutation.value);

        if (this.#add(value)) {
          return {
            op: 'remove',
            id: mutation.value.id,
          };
        }

        return null;
      }
      case 'remove': {
        const value = this.#idMap.get(mutation.id);
        if (value) {
          this.#remove(value);

          return {
            op: 'add',
            value: this.createChildSummary(value),
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
      value: this.createChildSummary(value),
    }, {
      op: 'remove',
      id: value.id,
    });

    return true;
  }

  addAll(values: T[]) {
    for (const value of values)
      this.add(value);
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
      value: this.createChildSummary(value),
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

  override get childObjects(): readonly SharedStructure<any>[] {
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

  ofType<U extends T>(type: new (...args: any) => U): U[] {
    return this.items.filter(it => it instanceof type) as U[];
  }

  override createSummary(): SortedListSummary {
    return {
      id: this.id,
      items: this.items.map(child => this.createChildSummary(child)),
    };
  }

  protected createChildSummary(child: T) {
    return child.createSummary();
  }

  override initializeFromSummary(summary: SortedListSummary) {
    this.id = summary.id;
    for (const item of summary.items) {
      this.add(this.createChildFromSummary(item));
    }
  }

  protected abstract createChildFromSummary(summary: any): T;
}
