import { IUnisonRuntime } from "./runtime";
import { IObjectSnapshot, SharedObject } from "./types";

export class Serializer {
  constructor(public readonly runtime: IUnisonRuntime) {}

  encode(value: unknown): ISerializableValue {
    if (value instanceof SharedObject) {
      const snapshot: IObjectSnapshot<unknown> = {
        attributes: value.attributes,
        content: value.createSnapshot(),
      };

      return {
        type: ValueType.Shared,
        value: snapshot,
      };
    }

    return {
      type: ValueType.Plain,
      value,
    };
  }

  decode<T = unknown>(value: ISerializableValue): T {
    if (value.type === ValueType.Shared) {
      const snapshot = value.value as IObjectSnapshot<unknown>;

      const factory = this.runtime.resolveType(snapshot.attributes.type);
      if (!factory) {
        throw new Error(`Unknown type: ${snapshot.attributes.type}`);
      }
      const object = factory.create(this.runtime);

      object.restore(snapshot);

      return object as T;
    }

    return value.value  as T //unpack(new Uint8Array(value.value)) as T;
  }
}

export interface ISerializableValue {
  type: ValueType;
  value: unknown;
}

export const enum ValueType {
  Shared = 0,
  Plain = 1,
}
