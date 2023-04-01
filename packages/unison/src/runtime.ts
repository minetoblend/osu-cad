import { SharedMapFactory } from "./types";
import { EventEmitter } from "events";
import { ITypeFactory, SharedRegisterFactory } from "./types";
import { Serializer } from "./serializer";
import { SharedObject } from "./types";

export interface IUnisonRuntime {
  resolveType(type: string): ITypeFactory<SharedObject> | undefined;

  serializer: Serializer;

  submitOp(node: SharedObject, op: unknown, localOpMetadata: unknown): void;

  on(
    event: "opSubmitted",
    listener: (
      node: SharedObject<unknown, unknown>,
      op: unknown,
      localOpMetadata: unknown
    ) => void
  ): this;

  off(
    event: "opSubmitted",
    listener: (
      node: SharedObject<unknown, unknown>,
      op: unknown,
      localOpMetadata: unknown
    ) => void
  ): this;

  track?(object: any, key: string, type: string): void;

  trigger?(object: any, key: string, value: any, type): void;
}

export interface IRequest {
  url: string;
  content?: unknown;
}

export interface IResponse {
  status: number;
  content: unknown;
}

export class UnisonBaseRuntime extends EventEmitter implements IUnisonRuntime {
  readonly typeMap = new Map<string, ITypeFactory>();

  constructor() {
    super();
    const typeFactories = [new SharedRegisterFactory(), new SharedMapFactory()];
    for (const factory of typeFactories) {
      this.typeMap.set(factory.type, factory);
    }
  }

  resolveType(type: string): ITypeFactory | undefined {
    return this.typeMap.get(type);
  }

  readonly serializer = new Serializer(this);

  submitOp(
    node: SharedObject<unknown, unknown>,
    op: unknown,
    localOpMetadata: unknown
  ) {
    this.emit("opSubmitted", node, op, localOpMetadata);
  }
}
