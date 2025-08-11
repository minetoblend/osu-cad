import type { ICompositeDecoder, IDecoder, ISparseObjectDecoder } from "../decoding/IDecoder.js";
import type { SerialDescriptor } from "../descriptor/SerialDescriptor.js";
import type { IDeserializationStrategy } from "../types.js";
import type { BinaryReader } from "./BinaryReader.js";

export abstract class AbstractBinaryDecoder implements IDecoder, ICompositeDecoder
{
  protected constructor(readonly reader: BinaryReader)
  {
  }

  decodeNotNullMark(): boolean
  {
    return this.decodeBoolean();
  }

  decodeNull(): null
  {
    return null;
  }

  decodeBoolean(): boolean
  {
    return this.reader.readBoolean();
  }

  decodeUint8(): number
  {
    return this.reader.readUint8();
  }

  decodeUint16(): number
  {
    return this.reader.readUint16();
  }

  decodeUint32(): number
  {
    return this.reader.readUint32();
  }

  decodeInt8(): number
  {
    return this.reader.readInt8();
  }

  decodeInt16(): number
  {
    return this.reader.readInt16();
  }

  decodeInt32(): number
  {
    return this.reader.readInt32();
  }

  decodeFloat32(): number
  {
    return this.reader.readFloat32();
  }

  decodeFloat64(): number
  {
    return this.reader.readFloat64();
  }

  decodeString(): string
  {
    return this.reader.readString();
  }

  decodeSerializableValue<T>(serializer: IDeserializationStrategy<T>): T
  {
    return serializer.deserialize(this);
  }

  decodeObject<T>(decode: (decoder: ICompositeDecoder) => T): T
  {
    return decode(this);
  }

  abstract decodeSparseObject<T>(decode: (size: number, decoder: ISparseObjectDecoder) => T): T;

  decodeArray<T>(decode: (length: number, decoder: IDecoder) => T): T
  {
    const length = this.reader.readVarInt();

    return decode(length, this);
  }

  decodeBooleanElement(descriptor: SerialDescriptor, index: number): boolean
  {
    return this.decodeBoolean();
  }

  decodeUint8Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeUint8();
  }

  decodeUint16Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeUint16();
  }

  decodeUint32Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeUint32();
  }

  decodeInt8Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeInt8();
  }

  decodeInt16Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeInt16();
  }

  decodeInt32Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeInt32();
  }

  decodeFloat32Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeFloat32();
  }

  decodeFloat64Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeFloat64();
  }

  decodeStringElement(descriptor: SerialDescriptor, index: number): string
  {
    return this.decodeString();
  }

  decodeSerializableElement<T>(descriptor: SerialDescriptor, index: number, serializer: IDeserializationStrategy<T>): T
  {
    return this.decodeSerializableValue(serializer);
  }
}
