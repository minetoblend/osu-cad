import type { SerialDescriptor } from './descriptor/SerialDescriptor';
import type { Encoder } from './encoder/Encoder';
import { Decoder } from "./decoder/Decoder";

export interface Serializer<T> extends SerializationStrategy<T>, DeserializationStrategy<T> {
  readonly descriptor: SerialDescriptor;
}

export interface SerializationStrategy<T> {
  readonly descriptor: SerialDescriptor;
  serialize(encoder: Encoder, value: T): void;
}

export interface DeserializationStrategy<T> {
  readonly descriptor: SerialDescriptor;
  deserialize(decoder: Decoder): T;
}
