import type { IDeserializationStrategy } from "../types.js";
import type { SerialDescriptor } from "../descriptor/SerialDescriptor.js";

export interface IDecoder
{
  decodeNotNullMark(): boolean
  decodeNull(): null
  decodeBoolean(): boolean
  decodeUint8(): number
  decodeUint16(): number
  decodeUint32(): number
  decodeInt8(): number
  decodeInt16(): number
  decodeInt32(): number
  decodeFloat32(): number
  decodeFloat64(): number
  decodeString(): string

  decodeSerializableValue<T>(serializer: IDeserializationStrategy<T>): T

  decodeObject<T>(decode: (decoder: ICompositeDecoder) => T): T
  decodeSparseObject<T>(decode: (size: number, decoder: ISparseObjectDecoder) => T): T
  decodeArray<T>(decode: (length: number, decoder: IDecoder) => T): T
}

export interface ICompositeDecoder
{
  decodeBooleanElement(descriptor: SerialDescriptor, index: number): boolean
  decodeUint8Element(descriptor: SerialDescriptor, index: number): number
  decodeUint16Element(descriptor: SerialDescriptor, index: number): number
  decodeUint32Element(descriptor: SerialDescriptor, index: number): number
  decodeInt8Element(descriptor: SerialDescriptor, index: number): number
  decodeInt16Element(descriptor: SerialDescriptor, index: number): number
  decodeInt32Element(descriptor: SerialDescriptor, index: number): number
  decodeFloat32Element(descriptor: SerialDescriptor, index: number): number
  decodeFloat64Element(descriptor: SerialDescriptor, index: number): number
  decodeStringElement(descriptor: SerialDescriptor, index: number): string

  decodeSerializableElement<T>(descriptor: SerialDescriptor, index: number, serializer: IDeserializationStrategy<T>): T
}

export interface ISparseObjectDecoder extends ICompositeDecoder
{
  decodeElementIndex(descriptor: SerialDescriptor): number
}
