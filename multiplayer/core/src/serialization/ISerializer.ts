import type { IDecoder, IEncoder } from "./types.js";

export interface ISerializer<Value, Plain = any>
{
  serialize: (value: Value, encoder: IEncoder) => Plain
  deserialize: (value: Plain, decoder: IDecoder) => Value
  equals?: (a: Value, b: Value) => boolean
}

export function serializer<Value, Plain>(serializer: ISerializer<Value, Plain>): ISerializer<Value, Plain>
{
  return serializer;
}

export function plainSerializer<Value>(): ISerializer<Value, Value>
{
  return {
    serialize: value => value,
    deserialize: value => value,
    equals: (a, b) => a === b,
  };
}
