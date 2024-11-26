import { CompositeDecoder, Decoder } from "./Decoder";
import { SerialDescriptor } from "../descriptor/SerialDescriptor";
import { DeserializationStrategy } from "../Serializer";

export abstract class BaseDecoder implements Decoder, CompositeDecoder {
  abstract beginStructure(descriptor: SerialDescriptor): CompositeDecoder;

  abstract decodeBoolean(): boolean;

  abstract decodeBooleanElement(descriptor: SerialDescriptor, index: number): boolean;

  decodeCollectionSize(descriptor: SerialDescriptor): number {
    return -1;
  }

  abstract decodeElementIndex(descriptor: SerialDescriptor): number;

  abstract decodeFloat32(): number;

  abstract decodeFloat32Element(descriptor: SerialDescriptor, index: number): number;

  abstract decodeFloat64(): number;

  abstract decodeFloat64Element(descriptor: SerialDescriptor, index: number): number;

  abstract decodeInt16(): number;

  abstract decodeInt16Element(descriptor: SerialDescriptor, index: number): number;

  abstract decodeInt32(): number;

  abstract decodeInt32Element(descriptor: SerialDescriptor, index: number): number;

  abstract decodeInt8(): number;

  abstract decodeInt8Element(descriptor: SerialDescriptor, index: number): number;

  abstract decodeNotNullMark(): boolean;

  abstract decodeNull(): null;

  abstract decodeNullableSerializableElement<T>(descriptor: SerialDescriptor, index: number, deserializer: DeserializationStrategy<T>, previousValue?: T): T | null;

  decodeNullableSerializableValue<T>(deserializer: DeserializationStrategy<T>): T | null {
    return this.decodeIfNullable(deserializer, () => this.decodeSerializableValue(deserializer));
  }

  decodeSequentially(): boolean {
    return false;
  }

  abstract decodeSerializableElement<T>(descriptor: SerialDescriptor, index: number, deserializer: DeserializationStrategy<T>, previousValue?: T): T;

  decodeSerializableValue<T>(deserializer: DeserializationStrategy<T>, previousValue?: T | undefined): T {
    return deserializer.deserialize(this);
  }

  abstract decodeString(): string;

  abstract decodeStringElement(descriptor: SerialDescriptor, index: number): string;

  abstract decodeUint16(): number;

  abstract decodeUint16Element(descriptor: SerialDescriptor, index: number): number;

  abstract decodeUint32(): number;

  abstract decodeUint32Element(descriptor: SerialDescriptor, index: number): number;

  abstract decodeUint8(): number;

  abstract decodeUint8Element(descriptor: SerialDescriptor, index: number): number;

  abstract endStructure(descriptor: SerialDescriptor);

  protected decodeIfNullable<T>(deserializer: DeserializationStrategy<T>, decode: () => T): T | null {
    const isNullabilitySupported = deserializer.descriptor.isNullable
    if (isNullabilitySupported || this.decodeNotNullMark())
      return decode()
    else
      return this.decodeNull()
  }
}

