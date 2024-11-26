import type { SerialDescriptor } from './descriptor/SerialDescriptor';
import type { Encoder } from './encoder/Encoder';

export interface Serializer<T> extends SerializationStrategy<T> {
  readonly descriptor: SerialDescriptor;
}

export interface SerializationStrategy<T> {
  readonly descriptor: SerialDescriptor;
  serialize(encoder: Encoder, value: T): void;
}
