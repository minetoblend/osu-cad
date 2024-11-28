import type { SerialDescriptor } from '../descriptor/SerialDescriptor';
import type { SerializationStrategy } from '../Serializer';

export interface Encoder {
  encodeNotNullMark(): void;

  encodeNull(): void;

  encodeBoolean(value: boolean): void;

  encodeUint8(value: number): void;

  encodeUint16(value: number): void;

  encodeUint32(value: number): void;

  encodeInt8(value: number): void;

  encodeInt16(value: number): void;

  encodeInt32(value: number): void;

  encodeFloat32(value: number): void;

  encodeFloat64(value: number): void;

  encodeString(value: string): void;

  beginStructure(descriptor: SerialDescriptor): CompositeEncoder;

  encodeStructure(descriptor: SerialDescriptor, fn: (encoder: CompositeEncoder) => void): void;

  beginCollection(descriptor: SerialDescriptor): CompositeEncoder;

  encodeSerializableValue<T>(serializer: SerializationStrategy<T>, value: T): void;

  encodeNullableSerializableValue<T>(serializer: SerializationStrategy<T>, value: T | null): void;
}

export interface CompositeEncoder {
  endStructure(descriptor: SerialDescriptor): void;

  encodeBooleanElement(descriptor: SerialDescriptor, index: number, value: boolean): void;

  encodeUint8Element(descriptor: SerialDescriptor, index: number, value: number): void;

  encodeUint16Element(descriptor: SerialDescriptor, index: number, value: number): void;

  encodeUint32Element(descriptor: SerialDescriptor, index: number, value: number): void;

  encodeInt8Element(descriptor: SerialDescriptor, index: number, value: number): void;

  encodeInt16Element(descriptor: SerialDescriptor, index: number, value: number): void;

  encodeInt32Element(descriptor: SerialDescriptor, index: number, value: number): void;

  encodeFloat32Element(descriptor: SerialDescriptor, index: number, value: number): void;

  encodeFloat64Element(descriptor: SerialDescriptor, index: number, value: number): void;

  encodeStringElement(descriptor: SerialDescriptor, index: number, value: string): void;

  encodeSerializableElement<T>(
    descriptor: SerialDescriptor,
    index: number,
    serializer: SerializationStrategy<T>,
    value: T
  ): void;

  encodeNullableSerializableElement<T>(
    descriptor: SerialDescriptor,
    index: number,
    serializer: SerializationStrategy<T>,
    value: T | null
  ): void;
}
