import type { SerialDescriptor } from '../descriptor/SerialDescriptor';
import type { SerializationStrategy } from '../Serializer';
import type { CompositeEncoder, Encoder } from './Encoder';

export abstract class BaseEncoder implements Encoder, CompositeEncoder {
  beginCollection(descriptor: SerialDescriptor): CompositeEncoder {
    return this.beginStructure(descriptor);
  }

  abstract beginStructure(descriptor: SerialDescriptor): CompositeEncoder;

  encodeStructure(descriptor: SerialDescriptor, fn: (encoder: CompositeEncoder) => void) {
    const composite = this.beginStructure(descriptor);
    fn(composite);
    composite.endStructure(descriptor);
  }

  abstract encodeBoolean(value: boolean): void;

  abstract encodeBooleanElement(descriptor: SerialDescriptor, index: number, value: boolean): void;

  abstract encodeFloat32(value: number): void;

  abstract encodeFloat32Element(descriptor: SerialDescriptor, index: number, value: number): void;

  abstract encodeFloat64(value: number): void;

  abstract encodeFloat64Element(descriptor: SerialDescriptor, index: number, value: number): void;

  abstract encodeInt16(value: number): void;

  abstract encodeInt16Element(descriptor: SerialDescriptor, index: number, value: number): void;

  abstract encodeInt32(value: number): void;

  abstract encodeInt32Element(descriptor: SerialDescriptor, index: number, value: number): void;

  abstract encodeInt8(value: number): void;

  abstract encodeInt8Element(descriptor: SerialDescriptor, index: number, value: number): void;

  abstract encodeNotNullMark(): void;

  abstract encodeNull(): void;

  abstract encodeNullableSerializableElement<T>(descriptor: SerialDescriptor, index: number, serializer: SerializationStrategy<T>, value: T | null): void;

  encodeSerializableValue<T>(serializer: SerializationStrategy<T>, value: T) {
    serializer.serialize(this, value);
  }

  encodeNullableSerializableValue<T>(serializer: SerializationStrategy<T>, value: T | null) {
    if (value === null) {
      this.encodeNull();
    }
    else {
      this.encodeSerializableValue(serializer, value);
    }
  }

  abstract encodeSerializableElement<T>(descriptor: SerialDescriptor, index: number, serializer: SerializationStrategy<T>, value: T): void;

  abstract encodeString(value: string): void;

  abstract encodeStringElement(descriptor: SerialDescriptor, index: number, value: string): void;

  abstract encodeUint16(value: number): void;

  abstract encodeUint16Element(descriptor: SerialDescriptor, index: number, value: number): void;

  abstract encodeUint32(value: number): void;

  abstract encodeUint32Element(descriptor: SerialDescriptor, index: number, value: number): void;

  abstract encodeUint8(value: number): void;

  abstract encodeUint8Element(descriptor: SerialDescriptor, index: number, value: number): void;

  abstract endStructure(descriptor: SerialDescriptor): void;
}
