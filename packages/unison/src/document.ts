import { IUnisonRuntime } from "./runtime";
import { IObjectSnapshot, SharedObject } from "./types";
import { assert } from "./util";

export interface IDocumentSnapshot {
  objects: {
    [key: string]: IObjectSnapshot<unknown>;
  };
}

export class Document<T extends object> extends SharedObject<
  {},
  IDocumentSnapshot
> {
  constructor(runtime: IUnisonRuntime, initialState = {} as T) {
    super(runtime, {
      type: "@osucad/document",
      version: "1.0",
    });
    this.objects = initialState;
  }

  readonly objects: T;

  createSnapshot(): IDocumentSnapshot {
    const snapshot = {} as Record<string, IObjectSnapshot<unknown>>;

    for (const [key, value] of Object.entries(this.objects)) {
      snapshot[key] = {
        attributes: value.attributes,
        content: value.createSnapshot(),
      };
    }

    return {
      objects: snapshot,
    };
  }

  restore(snapshot: IObjectSnapshot<IDocumentSnapshot>) {
    for (const [key, value] of Object.entries(snapshot.content.objects)) {
      const factory = this.runtime.resolveType(value.attributes.type);
      assert(!!factory, `Unknown type: ${value.attributes.type}`);

      const object = factory.create(this.runtime);
      object.restore(value);

      this.objects[key] = object as any;
      object.setParent(this, key);
    }
  }

  get needsRestore() {
    return true;
  }

  handle(op: unknown, local: boolean, localOpMetadata?: unknown): void {
    throw new Error("Document has no handlers.");
  }

  override get isAttached() {
    return true;
  }

  getChild(key: string) {
    return this.objects[key];
  }
}
