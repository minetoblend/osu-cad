import { SharedMap } from "@osucad/unison";
import {
  IObjectAttributes,
  IObjectSnapshot,
  SharedObject,
} from "./sharedObject";
import { ISerializableValue } from "../serializer";
import { v4 as uuid } from "uuid";
import { IUnisonRuntime } from "../runtime";
import { assert, nn } from "../util";

export type ISortedCollectionOperation =
  | ISortedCollectionInsertOperation
  | ISortedCollectionRemoveOperation;

export interface ISortedCollectionInsertOperation {
  type: "insert";
  id: string;
  value: ISerializableValue;
}

export interface ISortedCollectionRemoveOperation {
  type: "remove";
  id: string;
}

export interface ISortedCollectionSnapshotData {
  items: {
    key: string;
    value: ISerializableValue;
  }[];
}

export class SortedCollection<TItem extends SharedMap> extends SharedObject<
  ISortedCollectionOperation,
  ISortedCollectionSnapshotData
> {
  protected _items = [] as TItem[];

  protected _children = new Map<string, TItem>();

  constructor(
    runtime: IUnisonRuntime,
    attributes: IObjectAttributes,
    public readonly sortBy: string
  ) {
    super(runtime, attributes);

    this.initializeFirstTime?.();
  }

  initializeFirstTime?(): void;

  get items(): Array<TItem> {
    return this._items;
  }

  protected createUniqueId() {
    return uuid();
  }

  getChild(key: string): SharedObject | undefined {
    return this._children.get(key);
  }

  restore(snapshot: IObjectSnapshot<ISortedCollectionSnapshotData>): void {
    this._items.splice(
      0,
      this._items.length,
      ...snapshot.content.items.map((item) => {
        const object = this.serializer.decode(item.value) as TItem;
        object.setParent(this, item.key);

        const onChange = (key, value) => {
          this.onItemChange(object, key, value);
        };

        object.on("change", onChange);
        object.once("detached", () => object.off("change", onChange));

        return object;
      })
    );
    this._items.forEach((item) => {
      this._children.set(nn(item.id), item);
      this.emit("insert", item);
    });
    this.#onChange();
  }

  createSnapshot(): ISortedCollectionSnapshotData {
    return {
      items: this._items.map((item) => ({
        key: nn(item.id),
        value: this.serializer.encode(item),
      })),
    };
  }

  handle(
    op: ISortedCollectionOperation,
    local: boolean,
    localOpMetadata?: unknown
  ): void {
    switch (op.type) {
      case "insert": {
        if (local) return;
        const item = this.serializer.decode(op.value) as TItem;
        this._insert(item, op.id);
        break;
      }
      case "remove": {
        if (local) return;

        const item = this._items.find((item) => item.id === op.id);
        if (item) {
          this._remove(item!);
        }
        break;
      }
    }
  }

  insert(item: TItem): void {
    this._insert(item, this.createUniqueId());
    const op: ISortedCollectionInsertOperation = {
      type: "insert",
      id: nn(item.id),
      value: this.serializer.encode(item),
    };

    this.submitOp(op);
  }

  protected _insert(item: TItem, id: string): void {
    const { index } = this.binarySearch(item.get(this.sortBy) as number);

    item.setParent(this, id);

    this._items.splice(index, 0, item);
    this._children.set(id, item);
    
    const onChange = (key, value) => {
      this.onItemChange(item, key, value);
    };

    item.on("change", onChange);
    item.once("detached", () => item.off("change", onChange));

    this.emit("insert", item);

    this.#onChange();
  }

  #onChange() {
    this.onChange?.();
    this.emit("change", this._items);
  }

  onChange?(): void;

  remove(item: TItem): void {
    const id = nn(item.id);
    this._remove(item);

    const op: ISortedCollectionRemoveOperation = {
      type: "remove",
      id,
    };

    this.submitOp(op, {
      previousValue: {
        key: item.id,
        value: this.serializer.encode(item),
      },
    });
  }

  protected _remove(item: TItem): void {
    const id = nn(item.id);
    const index = this._items.indexOf(item);
    if (index !== -1) {
      this._items.splice(index, 1);
    }
    this._children.delete(nn(item.id));
    item.off("change", this.onItemChange);
    this.emit("remove", item, id);
    this.#onChange();
    item.detach();
  }

  binarySearch(value: number): { index: number; found: boolean } {
    let low = 0;
    let high = this._items.length - 1;
    let mid = 0;
    while (low <= high) {
      mid = Math.floor((low + high) / 2);
      const itemValue = this._items[mid].get(this.sortBy) as number;
      assert(typeof itemValue === "number", `${this.sortBy} is not a number`);

      if (itemValue === value) {
        return { index: mid, found: true };
      }
      if (itemValue < value) {
        low = mid + 1;
      }
      if (itemValue > value) {
        high = mid - 1;
      }
    }

    return { index: low, found: false };
  }

  get(index: number): TItem | undefined {
    return this._items[index];
  }

  slice(start: number, end?: number): TItem[] {
    return this._items.slice(start, end);
  }

  get length(): number {
    return this._items.length;
  }

  onItemChange(item: TItem, key: string, value: any) {
    if (key === this.sortBy) {
      const id = nn(item.id);

      const index = this._items.indexOf(item);
      this._items.splice(index, 1);

      const { index: newIndex } = this.binarySearch(value as number);

      this._items.splice(newIndex, 0, item);
    }
    this.emit("itemChange", item, key, value);
  }
}
