import type { DDS } from "src/dds/DDS.js";
import type { SerialDescriptor } from "../descriptor/SerialDescriptor.js";
import type { ICompositeEncoder } from "../encoding/IEncoder.js";
import type { ISerializationStrategy } from "../types.js";
import type { BinaryEncoder } from "./BinaryEncoder.js";

export class BinarySparseObjectEncoder implements ICompositeEncoder
{
  constructor(readonly encoder: BinaryEncoder)
  {
  }

  get writer()
  {
    return this.encoder.writer;
  }

  encodeSerializableElement<T>(descriptor: SerialDescriptor, index: number, serializer: ISerializationStrategy<T>, value: T): void
  {
    this.writer.writeVarInt(index);
    serializer.serialize(this.encoder, value);
  }

  encodeBooleanElement(descriptor: SerialDescriptor, index: number, value: boolean): void
  {
    this.writer.writeVarInt(index);
    this.encoder.encodeBoolean(value);
  }

  encodeUint8Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.writer.writeVarInt(index);
    this.encoder.encodeUint8(value);
  }

  encodeUint16Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.writer.writeVarInt(index);
    this.encoder.encodeUint16(value);
  }

  encodeUint32Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.writer.writeVarInt(index);
    this.encoder.encodeUint32(value);
  }

  encodeInt8Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.writer.writeVarInt(index);
    this.encoder.encodeInt8(value);
  }

  encodeInt16Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.writer.writeVarInt(index);
    this.encoder.encodeInt16(value);
  }

  encodeInt32Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.writer.writeVarInt(index);
    this.encoder.encodeInt32(value);
  }

  encodeFloat32Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.writer.writeVarInt(index);
    this.encoder.encodeFloat32(value);
  }

  encodeFloat64Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.writer.writeVarInt(index);
    this.encoder.encodeFloat64(value);
  }

  encodeStringElement(descriptor: SerialDescriptor, index: number, value: string): void
  {
    this.writer.writeVarInt(index);
    this.encoder.encodeString(value);
  }

  encodeDDSElement(descriptor: SerialDescriptor, index: number, value: DDS): void
  {
    this.writer.writeVarInt(index);
    this.encoder.encodeDDS(value);
  }
}
