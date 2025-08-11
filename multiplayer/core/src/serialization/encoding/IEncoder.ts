import type { ISerializationStrategy } from "../types.js";
import type { DDS } from "../../dds/DDS.js";
import type { SerialDescriptor } from "../descriptor/SerialDescriptor.js";
import { ICompositeDecoder } from "../decoding/IDecoder.js";

export interface IEncoder
{
  encodeSerializableValue<T>(serializer: ISerializationStrategy<T>, value: T): void

  encodeNotNullMark(): void
  encodeNull(): void

  encodeBoolean(value: boolean): void
  encodeUint8(value: number): void
  encodeUint16(value: number): void
  encodeUint32(value: number): void
  encodeInt8(value: number): void
  encodeInt16(value: number): void
  encodeInt32(value: number): void
  encodeFloat32(value: number): void
  encodeFloat64(value: number): void
  encodeString(value: string): void

  encodeDDS(value: DDS): void

  encodeObject(encode: (encoder: ICompositeEncoder) => void): void;
  encodeSparseObject(size: number, encode: (encoder: ICompositeEncoder) => void): void;
  encodeArray(length: number, encode: (encoder: IEncoder) => void): void
}


export interface ICompositeEncoder
{
  encodeSerializableElement<T>(descriptor: SerialDescriptor, index: number, serializer: ISerializationStrategy<T>, value: T): void

  encodeBooleanElement(descriptor: SerialDescriptor, index: number, value: boolean): void
  encodeUint8Element(descriptor: SerialDescriptor, index: number, value: number): void
  encodeUint16Element(descriptor: SerialDescriptor, index: number, value: number): void
  encodeUint32Element(descriptor: SerialDescriptor, index: number, value: number): void
  encodeInt8Element(descriptor: SerialDescriptor, index: number, value: number): void
  encodeInt16Element(descriptor: SerialDescriptor, index: number, value: number): void
  encodeInt32Element(descriptor: SerialDescriptor, index: number, value: number): void
  encodeFloat32Element(descriptor: SerialDescriptor, index: number, value: number): void
  encodeFloat64Element(descriptor: SerialDescriptor, index: number, value: number): void
  encodeStringElement(descriptor: SerialDescriptor, index: number, value: string): void

  encodeDDSElement(descriptor: SerialDescriptor, index: number, value: DDS): void
}
