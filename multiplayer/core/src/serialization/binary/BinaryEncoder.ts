import type { DDS } from "src/dds/DDS.js";
import type { ICompositeEncoder, IEncoder } from "../encoding/IEncoder.js";
import type { ISerializationStrategy } from "../types.js";
import type { BinaryWriter } from "./BinaryWriter.js";
import { nn } from "../../utils/nn.js";
import type { SerialDescriptor } from "../descriptor/SerialDescriptor.js";
import { BinarySparseObjectEncoder } from "./BinarySparseObjectEncoder.js";

export class BinaryEncoder implements IEncoder, ICompositeEncoder
{
  constructor(readonly writer: BinaryWriter)
  {
  }

  encodeSerializableValue<T>(serializer: ISerializationStrategy<T>, value: T): void
  {
    serializer.serialize(this, value);
  }

  encodeNotNullMark(): void
  {
    this.writer.writeBoolean(true);
  }

  encodeNull(): void
  {
    this.writer.writeBoolean(false);
  }

  encodeBoolean(value: boolean): void
  {
    this.writer.writeBoolean(value);
  }

  encodeUint8(value: number): void
  {
    this.writer.writeUint8(value);
  }

  encodeUint16(value: number): void
  {
    this.writer.writeUint16(value);
  }

  encodeUint32(value: number): void
  {
    this.writer.writeUint32(value);
  }

  encodeInt8(value: number): void
  {
    this.writer.writeInt8(value);
  }

  encodeInt16(value: number): void
  {
    this.writer.writeInt16(value);
  }

  encodeInt32(value: number): void
  {
    this.writer.writeInt32(value);
  }

  encodeFloat32(value: number): void
  {
    this.writer.writeFloat32(value);
  }

  encodeFloat64(value: number): void
  {
    this.writer.writeFloat64(value);
  }

  encodeString(value: string): void
  {
    this.writer.writeString(value);
  }

  encodeDDS(value: DDS): void
  {
    this.writer.writeUuid(nn(value.id));
  }

  protected encodePropertyKey(descriptor: SerialDescriptor, index: number)
  {
  }

  encodeSerializableElement<T>(descriptor: SerialDescriptor, index: number, serializer: ISerializationStrategy<T>, value: T): void
  {
    this.encodePropertyKey(descriptor, index);
    this.encodeSerializableValue(serializer, value);
  }

  encodeBooleanElement(descriptor: SerialDescriptor, index: number, value: boolean): void
  {
    this.encodePropertyKey(descriptor, index);
    this.encodeBoolean(value);
  }

  encodeUint8Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodePropertyKey(descriptor, index);
    this.encodeUint8(value);
  }

  encodeUint16Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodePropertyKey(descriptor, index);
    this.encodeUint16(value);
  }

  encodeUint32Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodePropertyKey(descriptor, index);
    this.encodeUint32(value);
  }

  encodeInt8Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodePropertyKey(descriptor, index);
    this.encodeInt8(value);
  }

  encodeInt16Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodePropertyKey(descriptor, index);
    this.encodeInt16(value);
  }

  encodeInt32Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodePropertyKey(descriptor, index);
    this.encodeInt32(value);
  }

  encodeFloat32Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodePropertyKey(descriptor, index);
    this.encodeFloat32(value);
  }

  encodeFloat64Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodePropertyKey(descriptor, index);
    this.encodeFloat64(value);
  }

  encodeStringElement(descriptor: SerialDescriptor, index: number, value: string): void
  {
    this.encodePropertyKey(descriptor, index);
    this.encodeString(value);
  }

  encodeDDSElement(descriptor: SerialDescriptor, index: number, value: DDS): void
  {
    this.encodePropertyKey(descriptor, index);
    this.encodeDDS(value);
  }

  public encodeObject(encode: (encoder: ICompositeEncoder) => void): void
  {
    encode(this);
  }

  public encodeSparseObject(size: number, encode: (encoder: ICompositeEncoder) => void): void
  {
    this.writer.writeVarInt(size);

    encode(new BinarySparseObjectEncoder(this));
  }

  public encodeArray(length: number, encode: (encoder: IEncoder) => void): void
  {
    this.writer.writeVarInt(length);

    encode(this);
  }
}
