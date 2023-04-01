import {ITypeFactory} from ".";
import {IUnisonRuntime} from "../runtime";
import {ISerializableValue} from "../serializer";
import {assert} from "../util";
import {IObjectAttributes, IObjectSnapshot, SharedObject,} from "./sharedObject";

export interface IMapSnapshotData {
  [key: string]: ISerializableValue;
}

export type IMapOperation =
  | IMapSetOperation
  | IMapDeleteOperation
  | IMapClearOperation;

export interface IMapSetOperation {
  type: "set";
  key: string;
  value: ISerializableValue;
  version: number;
}

export interface IMapDeleteOperation {
  type: "delete";
  key: string;
  version: number;
}

export interface IMapClearOperation {
  type: "clear";
  version: number;
}

export class SharedMap extends SharedObject<IMapOperation, IMapSnapshotData> {
  readonly #values = new Map<string, unknown>();
  #localVersion = 0;
  readonly #pending = new Map<string, number>();
  #pendingClear: number | undefined = undefined;

  constructor(
    runtime: IUnisonRuntime,
    attributes: IObjectAttributes = SharedMapFactory.Attributes
  ) {
    super(runtime, attributes);

    this.initializeFirstTime();
  }

  initializeFirstTime(): void {}

  restore(snapshot: IObjectSnapshot<IMapSnapshotData>): void {
    this.#clear();

    for (const [key, value] of Object.entries(snapshot.content)) {
      this.#set(key, this.serializer.decode(value));
    }
  }

  entries() {
    return this.#values.entries();
  }

  keys() {
    return this.#values.keys();
  }

  values() {
    return this.#values.values();
  }

  #set(key: string, value: unknown) {
    const previousValue = this.#values.get(key);
    this.#values.set(key, value);
    this.#onChange(key, value);
    this.runtime.trigger?.(this, key, value, "set");
    return previousValue;
  }

  set(key: string, value: unknown): void {
    const previousValue = this.#set(key, value);
    if (this.isAttached) {
      const version = this.#localVersion++;
      const op: IMapSetOperation = {
        type: "set",
        key,
        version,
        value: this.serializer.encode(value),
      };

      this.#markAsPending(key, version);

      this.submitOp(op, {
        previousValue: this.serializer.encode(previousValue),
      });
    }
  }

  get(key: string): unknown {
    this.runtime.track?.(this, key, "get");
    return this.#values.get(key);
  }

  #delete(key: string) {
    const previousValue = this.#values.get(key);
    this.#values.delete(key);
    this.#onChange(key, undefined);
    this.runtime.track?.(this, key, "delete");
    return previousValue;
  }

  delete(key: string): void {
    const previousValue = this.#delete(key);

    const version = this.#localVersion++;
    const op: IMapDeleteOperation = {
      type: "delete",
      key,
      version,
    };

    this.submitOp(op, {
      previousValue: this.serializer.encode(previousValue),
    });
  }

  #clear() {
    const keys = [...this.#values.keys()];
    this.#values.forEach((_, key) => this.runtime.track?.(this, key, "delete"));
    this.#values.clear();

    keys.forEach((key) => this.#onChange(key, undefined));
  }

  clear(): void {
    const snapshot = this.createSnapshot();
    this.#clear();
    const version = this.#localVersion++;

    const op: IMapClearOperation = {
      type: "clear",
      version,
    };

    this.#pendingClear = version;

    this.submitOp(op, {
      previousValues: snapshot,
    });
  }

  createSnapshot(): IMapSnapshotData {
    const snapshot = {} as IMapSnapshotData;

    for (const [key, value] of this.#values) {
      snapshot[key] = this.serializer.encode(value);
    }

    return snapshot;
  }

  handle(op: IMapOperation, local: boolean, localOpMetadata?: unknown): void {
    switch (op.type) {
      case "set": {
        if (local) {
          this.#resolvePendingVersion(op.key, op.version);
        } else {
          if (this.#pending.has(op.key)) return;

          const value = this.serializer.decode(op.value);

          this.#set(op.key, value);
          this.runtime.trigger?.(this, op.key, value, "set");
        }
        break;
      }
      case "delete": {
        if (local) {
          this.#resolvePendingVersion(op.key, op.version);
        } else {
          if (this.#pending.has(op.key)) return;

          this.#delete(op.key);
          this.runtime.trigger?.(this, op.key, undefined, "delete");
        }
        break;
      }
      case "clear": {
        if (local) {
          assert(!!this.#pendingClear && op.version <= this.#pendingClear);
          if (op.version === this.#pendingClear) {
            this.#pendingClear = undefined;
          }
        } else {
          [...this.#values.keys()].forEach((key) => {
            if (this.#pending.has(key)) return;
            this.#delete(key);
          });
        }
        break;
      }
    }
  }

  #markAsPending(key: string, version: number) {
    this.#pending.set(key, version);
  }

  #resolvePendingVersion(key: string, version: number) {
    const pendingVersion = this.#pending.get(key);
    assert(pendingVersion !== undefined && version <= pendingVersion);
    if (version === pendingVersion) {
      this.#pending.delete(key);
    }
  }

  squashOps(
    first: IMapOperation,
    second: IMapOperation
  ): IMapOperation | undefined {
    if (second.type === "clear") return second;
    if (
      (second.type === "set" || second.type === "delete") &&
      (first.type === "set" || first.type === "delete")
    ) {
      if (first.key === second.key) {
        return second;
      }
    }
    return undefined;
  }

  #onChange(key: string, value: unknown) {
    this.emit("change", key, value);
    this.onChange?.(key, value);
  }

  onChange?(key: string, value: unknown): void;
}

export class SharedMapFactory implements ITypeFactory {
  static readonly Type = "@osucad/map";

  get type() {
    return SharedMapFactory.Type;
  }

  static readonly Attributes: IObjectAttributes = {
    type: SharedMapFactory.Type,
    version: "0.1",
  };

  get attributes() {
    return SharedMapFactory.Attributes;
  }

  create(runtime: IUnisonRuntime): SharedObject<unknown, unknown> {
    return new SharedMap(runtime);
  }
}
