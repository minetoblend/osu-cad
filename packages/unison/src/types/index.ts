import {IUnisonRuntime} from "../runtime";
import {IObjectAttributes, SharedObject} from "./sharedObject";

export interface ITypeFactory<T extends SharedObject = SharedObject> {
  readonly type: string;
  readonly attributes: IObjectAttributes;
  create(runtime: IUnisonRuntime): T;
}

export * from "./sharedObject";
export * from "./register";
export * from "./map";
export * from "./sortedCollection";
