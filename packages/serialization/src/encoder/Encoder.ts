import type { SerialDescriptor } from '../descriptor/SerialDescriptor';
import type { SerializationStrategy } from '../Serializer';

export interface Encoder {
  encodeNotNullMark();

  encodeNull();

  encodeBoolean(value: boolean);

  encodeUint8(value: number);

  encodeUint16(value: number);

  encodeUint32(value: number);

  encodeInt8(value: number);

  encodeInt16(value: number);

  encodeInt32(value: number);

  encodeFloat32(value: number);

  encodeFloat64(value: number);

  encodeString(value: string);

  beginStructure(descriptor: SerialDescriptor): CompositeEncoder;

  encodeStructure(descriptor: SerialDescriptor, fn: (encoder: CompositeEncoder) => void);

  beginCollection(descriptor: SerialDescriptor): CompositeEncoder;

  encodeSerializableValue<T>(serializer: SerializationStrategy<T>, value: T);

  encodeNullableSerializableValue<T>(serializer: SerializationStrategy<T>, value: T | null);
}

export interface CompositeEncoder {
  endStructure(descriptor: SerialDescriptor);

  encodeBooleanElement(descriptor: SerialDescriptor, index: number, value: boolean);

  encodeUint8Element(descriptor: SerialDescriptor, index: number, value: number);

  encodeUint16Element(descriptor: SerialDescriptor, index: number, value: number);

  encodeUint32Element(descriptor: SerialDescriptor, index: number, value: number);

  encodeInt8Element(descriptor: SerialDescriptor, index: number, value: number);

  encodeInt16Element(descriptor: SerialDescriptor, index: number, value: number);

  encodeInt32Element(descriptor: SerialDescriptor, index: number, value: number);

  encodeFloat32Element(descriptor: SerialDescriptor, index: number, value: number);

  encodeFloat64Element(descriptor: SerialDescriptor, index: number, value: number);

  encodeStringElement(descriptor: SerialDescriptor, index: number, value: string);

  encodeSerializableElement<T>(
    descriptor: SerialDescriptor,
    index: number,
    serializer: SerializationStrategy<T>,
    value: T
  );

  encodeNullableSerializableElement<T>(
    descriptor: SerialDescriptor,
    index: number,
    serializer: SerializationStrategy<T>,
    value: T | null
  );
}
