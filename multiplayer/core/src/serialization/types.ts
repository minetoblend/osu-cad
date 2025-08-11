import type { IEncoder } from "./encoding/IEncoder.js";
import type { IDecoder } from "./decoding/IDecoder.js";
import type { SerialDescriptor } from "./descriptor/SerialDescriptor.js";

export interface ISerializationStrategy<in T>
{
  descriptor: SerialDescriptor
  serialize(encoder: IEncoder, value: T): void
}

export interface IDeserializationStrategy<out T>
{
  descriptor: SerialDescriptor
  deserialize(decoder: IDecoder): T
}

export interface ISerializer<T> extends ISerializationStrategy<T>, IDeserializationStrategy<T>
{
}
