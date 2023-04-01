import EventEmitter from "events";
import { IUnisonRuntime } from "../runtime";

export abstract class SharedObject<
  TOperation = unknown,
  TSnapshot = unknown
> extends EventEmitter {
  constructor(
    protected readonly runtime: IUnisonRuntime,
    readonly attributes: IObjectAttributes
  ) {
    super();
  }

  #id: string | undefined;

  get id() {
    return this.#id;
  }

  #parent: SharedObject | undefined;

  get parent() {
    return this.#parent;
  }

  get path(): string | undefined {
    if (!this.isAttached) return undefined;
    return this.parent?.path ? this.parent.path + "/" + this.id : this.id;
  }

  abstract restore(snapshot: IObjectSnapshot<TSnapshot>): void;

  get serializer() {
    return this.runtime.serializer;
  }

  abstract createSnapshot(): TSnapshot;

  get isAttached() {
    return !!this.#parent?.isAttached;
  }

  submitOp(op: TOperation, localOpMetadata?: unknown) {
    if (this.isAttached) {
      this.runtime.submitOp(this, op, localOpMetadata);
    }
    this.emit("opSubmitted", op, localOpMetadata);
  }

  abstract handle(
    op: TOperation,
    local: boolean,
    localOpMetadata?: unknown
  ): void;

  setParent(parent: SharedObject, key: string) {
    this.#parent = parent;
    this.#id = key;

    this.emit("attached", parent, key);
  }

  detach() {
    this.#parent = undefined;
    this.#id = undefined;
    this.emit("detached");
  }

  getChildren?(): SharedObject[];

  getChild?(key: string): SharedObject | undefined;

  find(path: string) {
    let parts = path.split("/");
    let current: SharedObject | undefined = this;
    for (let i = 0; i < parts.length; i++) {
      current = current!.getChild?.(parts[i]);
      if (current === undefined) return undefined;
    }
    return current;
  }

  squashOps?(
    first: TOperation,
    second: TOperation
  ): TOperation | undefined;
}

export interface IObjectSnapshot<T> {
  readonly attributes: IObjectAttributes;
  readonly content: T;
}

export interface IObjectAttributes {
  readonly type: string;
  readonly version: string;
}

export interface IOperationWithMetadata<T> {
  op: T;
  localOpMetadata?: unknown;
}
