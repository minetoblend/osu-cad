import type { SerialDescriptor } from '../descriptor/SerialDescriptor';
import type { SerializationStrategy } from '../Serializer';
import type { CompositeEncoder, Encoder } from './Encoder';

export abstract class BaseEncoder implements Encoder, CompositeEncoder {
  beginCollection(descriptor: SerialDescriptor): CompositeEncoder {
    return this.beginStructure(descriptor);
  }

  abstract beginStructure(descriptor: SerialDescriptor): CompositeEncoder;

  encodeStructure(descriptor: SerialDescriptor, fn: (CompositeEncoder) => void) {
    const composite = this.beginStructure(descriptor);
    fn(composite);
    composite.endStructure(descriptor);
  }

  abstract encodeBoolean(value: boolean);

  abstract encodeBooleanElement(descriptor: SerialDescriptor, index: number, value: boolean);

  abstract encodeFloat32(value: number);

  abstract encodeFloat32Element(descriptor: SerialDescriptor, index: number, value: number);

  abstract encodeFloat64(value: number);

  abstract encodeFloat64Element(descriptor: SerialDescriptor, index: number, value: number);

  abstract encodeInt16(value: number);

  abstract encodeInt16Element(descriptor: SerialDescriptor, index: number, value: number);

  abstract encodeInt32(value: number);

  abstract encodeInt32Element(descriptor: SerialDescriptor, index: number, value: number);

  abstract encodeInt8(value: number);

  abstract encodeInt8Element(descriptor: SerialDescriptor, index: number, value: number);

  abstract encodeNotNullMark();

  abstract encodeNull();

  abstract encodeNullableSerializableElement<T>(descriptor: SerialDescriptor, index: number, serializer: SerializationStrategy<T>, value: T | null);

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

  abstract encodeSerializableElement<T>(descriptor: SerialDescriptor, index: number, serializer: SerializationStrategy<T>, value: T);

  abstract encodeString(value: string);

  abstract encodeStringElement(descriptor: SerialDescriptor, index: number, value: string);

  abstract encodeUint16(value: number);

  abstract encodeUint16Element(descriptor: SerialDescriptor, index: number, value: number);

  abstract encodeUint32(value: number);

  abstract encodeUint32Element(descriptor: SerialDescriptor, index: number, value: number);

  abstract encodeUint8(value: number);

  abstract encodeUint8Element(descriptor: SerialDescriptor, index: number, value: number);

  abstract endStructure(descriptor: SerialDescriptor);
}
