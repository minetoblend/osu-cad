import type { IComparer } from '@osucad/framework';
import type { ISequencedDocumentMessage } from '../../interfaces/messages';
import type { ISummary } from '../ISummary';
import type { ObjectSummary } from '../object/SharedObject';
import { Action, SortedList } from '@osucad/framework';
import { SharedStructure } from '../SharedStructure';

export type SortedListMessage =
  | ISortedListAddMessage
  | ISortedListRemoveMessage;

export interface ISortedListAddMessage {
  type: 'add';
  summary: ObjectSummary;
}

export interface ISortedListRemoveMessage {
  type: 'remove';
  id: string;
}

export interface SortedListSummary extends ISummary {
  items: any[];
}

export abstract class SharedSortedList<T extends SharedStructure<any>> extends SharedStructure<SortedListMessage, SortedListSummary> {
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

  override process(message: ISequencedDocumentMessage, local: boolean) {
    if (local)
      return;

    const op = message.contents as SortedListMessage;

    switch (op.type) {
      case 'add': {
        const item = this.createChildFromSummary(op.summary);

        this.#add(item);
        break;
      }
      case 'remove': {
        const item = this.getById(op.id);
        if (!item)
          return;

        this.#remove(item);
        break;
      }
    }
  }

  override replayOp(contents: unknown) {
    const op = contents as SortedListMessage;

    switch (op.type) {
      case 'add': {
        const item = this.createChildFromSummary(op.summary);

        this.add(item);
        break;
      }
      case 'remove': {
        const item = this.getById(op.id);
        if (item)
          this.remove(item);
        break;
      }
    }
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

  add(item: T) {
    if (!this.#add(item))
      return false;

    if (!this.isAttached)
      return true;

    const op: ISortedListAddMessage = {
      type: 'add',
      summary: this.createChildSummary(item),
    };

    const undoOp: ISortedListRemoveMessage = {
      type: 'remove',
      id: item.id,
    };

    this.submitMutation(op, undoOp);

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

  remove(item: T) {
    if (!this.#remove(item))
      return false;

    if (!this.isAttached)
      return true;

    const op: ISortedListRemoveMessage = {
      type: 'remove',
      id: item.id,
    };

    const undoOp: ISortedListAddMessage = {
      type: 'add',
      summary: this.createChildSummary(item),
    };

    this.submitMutation(op, undoOp);

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
