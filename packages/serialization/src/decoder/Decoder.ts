import type { SerialDescriptor } from '../descriptor/SerialDescriptor';
import type { DeserializationStrategy } from '../Serializer';

export interface Decoder {
  decodeNotNullMark(): boolean;

  decodeNull(): null;

  decodeBoolean(): boolean;

  decodeUint8(): number;

  decodeUint16(): number;

  decodeUint32(): number;

  decodeInt8(): number;

  decodeInt16(): number;

  decodeInt32(): number;

  decodeFloat32(): number;

  decodeFloat64(): number;

  decodeString(): string;

  beginStructure(descriptor: SerialDescriptor): CompositeDecoder;

  decodeStructure<T>(descriptor: SerialDescriptor, fn: (decoder: CompositeDecoder) => T): T;

  decodeSerializableValue<T>(deserializer: DeserializationStrategy<T>): T;

  decodeNullableSerializableValue<T>(deserializer: DeserializationStrategy<T>): T | null;
}

export const CompositeDecoder = {
  DECODE_DONE: -1,
  UNKNOWN_NAME: -3,
};

export interface CompositeDecoder {
  endStructure(descriptor: SerialDescriptor): void;

  decodeSequentially(): boolean;

  decodeElementIndex(descriptor: SerialDescriptor): number;

  decodeCollectionSize(descriptor: SerialDescriptor): number;

  decodeBooleanElement(descriptor: SerialDescriptor, index: number): boolean;

  decodeUint8Element(descriptor: SerialDescriptor, index: number): number;

  decodeUint16Element(descriptor: SerialDescriptor, index: number): number;

  decodeUint32Element(descriptor: SerialDescriptor, index: number): number;

  decodeInt8Element(descriptor: SerialDescriptor, index: number): number;

  decodeInt16Element(descriptor: SerialDescriptor, index: number): number;

  decodeInt32Element(descriptor: SerialDescriptor, index: number): number;

  decodeFloat32Element(descriptor: SerialDescriptor, index: number): number;

  decodeFloat64Element(descriptor: SerialDescriptor, index: number): number;

  decodeStringElement(descriptor: SerialDescriptor, index: number): string;

  decodeSerializableElement<T>(
    descriptor: SerialDescriptor,
    index: number,
    deserializer: DeserializationStrategy<T>,
    previousValue?: T,
  ): T;

  decodeNullableSerializableElement<T>(
    descriptor: SerialDescriptor,
    index: number,
    deserializer: DeserializationStrategy<T>,
    previousValue?: T,
  ): T | null;
}
