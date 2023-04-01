import {ITypeFactory} from "./index";
import {IUnisonRuntime} from "../runtime";
import {IObjectAttributes, IObjectSnapshot, SharedObject,} from "./sharedObject";
import {ISerializableValue} from "../serializer";
import {assert} from "../util";

export type IRegisterOp = IRegisterSetOp;

export interface IRegisterSetOp {
  type: "set";
  value: ISerializableValue;
  version: number;
}

export class SharedRegister<TValue> extends SharedObject<
  IRegisterSetOp,
  ISerializableValue
> {
  constructor(runtime: IUnisonRuntime, initialValue: TValue) {
    super(runtime, SharedRegisterFactory.Attributes);

    this.#value = initialValue;
  }

  #value: TValue;
  #localVersion = 0;
  #pending: number[] = [];

  static getFactory() {
    return new SharedRegisterFactory();
  }

  createSnapshot(): ISerializableValue {
    return this.serializer.encode(this.#value);
  }

  restore(snapshot: IObjectSnapshot<ISerializableValue>): void {
    this.#value = this.serializer.decode(snapshot.content);
  }

  get value(): TValue {
    this.runtime.track?.(this, 'value', 'get');
    return this.#value;
  }

  set value(value: TValue) {
    const previousValue = this.#set(value);

    const version = this.#localVersion++;

    const op: IRegisterSetOp = {
      type: "set",
      value: this.serializer.encode(value),
      version,
    };

    this.#pending.push(version);

    this.submitOp(op, {
      previousValue: this.serializer.encode(previousValue),
    });
  }

  #set(value: TValue): TValue {
    const previousValue = this.#value;
    this.#value = value;
    this.runtime.trigger?.(this, 'value', value, 'set')
    return previousValue;
  }

  handle(op: IRegisterSetOp, local: boolean, localOpMetadata?: unknown): void {
    if (local) {
      assert(this.#pending.shift() === op.version);
    } else {
      // Since we are assuming that all pending ops will be applied, we are ignoring any incoming operations until all of our pending ops have been resolved.
      if (this.#pending.length > 0) return;

      const value = this.serializer.decode<TValue>(op.value);
      this.#set(value);
    }
  }
}

export class SharedRegisterFactory
  implements ITypeFactory<SharedRegister<any>>
{
  static readonly Type = "@osucad/unison/register";
  readonly type = SharedRegisterFactory.Type;

  static readonly Attributes: IObjectAttributes = {
    type: SharedRegisterFactory.Type,
    version: "0.1",
  };

  readonly attributes = SharedRegisterFactory.Attributes;

  create<T>(runtime: IUnisonRuntime, initialValue?: T): SharedRegister<T> {
    return new SharedRegister(runtime, initialValue as T);
  }
}
