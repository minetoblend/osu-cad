import type { DDS } from "src/dds/DDS.js";
import type { ISerializationStrategy } from "src/serialization/types.js";
import type { ICompositeEncoder, IEncoder } from "../serialization/encoding/IEncoder.js";
import type { SerialDescriptor } from "src/serialization/descriptor/SerialDescriptor.js";

export class DDSTrackingEncoder implements IEncoder
{
  constructor(
    readonly encoder: IEncoder,
    readonly trackObject: (value: DDS) => void,
  )
  {
  }

  encodeSerializableValue<T>(serializer: ISerializationStrategy<T>, value: T): void
  {
    this.encoder.encodeSerializableValue(serializer, value);
  }

  encodeNotNullMark(): void
  {
    this.encoder.encodeNotNullMark();
  }

  encodeNull(): void
  {
    this.encoder.encodeNull();
  }

  encodeBoolean(value: boolean): void
  {
    this.encoder.encodeBoolean(value);
  }

  encodeUint8(value: number): void
  {
    this.encoder.encodeUint8(value);
  }

  encodeUint16(value: number): void
  {
    this.encoder.encodeUint16(value);
  }

  encodeUint32(value: number): void
  {
    this.encoder.encodeUint32(value);
  }

  encodeInt8(value: number): void
  {
    this.encoder.encodeInt8(value);
  }

  encodeInt16(value: number): void
  {
    this.encoder.encodeInt16(value);
  }

  encodeInt32(value: number): void
  {
    this.encoder.encodeInt32(value);
  }

  encodeFloat32(value: number): void
  {
    this.encoder.encodeFloat32(value);
  }

  encodeFloat64(value: number): void
  {
    this.encoder.encodeFloat64(value);
  }

  encodeString(value: string): void
  {
    this.encoder.encodeString(value);
  }

  encodeDDS(value: DDS): void
  {
    this.trackObject(value);
    this.encoder.encodeDDS(value);
  }

  encodeObject(encode: (encoder: ICompositeEncoder) => void): void
  {
    this.encoder.encodeObject(encoder => encode(new DDSTrackingCompositeEncoder(encoder, this.trackObject)));
  }

  encodeSparseObject(size: number, encode: (encoder: ICompositeEncoder) => void): void
  {
    this.encoder.encodeSparseObject(size, encoder => encode(new DDSTrackingCompositeEncoder(encoder, this.trackObject)));
  }

  encodeArray(length: number, encode: (encoder: IEncoder) => void): void
  {
    this.encoder.encodeArray(length, encoder => encode(new DDSTrackingEncoder(encoder, this.trackObject)));
  }
}

class DDSTrackingCompositeEncoder implements ICompositeEncoder
{
  constructor(readonly encoder: ICompositeEncoder, readonly trackObject: (value: DDS) => void)
  {
  }

  encodeSerializableElement<T>(descriptor: SerialDescriptor, index: number, serializer: ISerializationStrategy<T>, value: T): void
  {
    this.encoder.encodeSerializableElement(descriptor, index, serializer, value);
  }

  encodeBooleanElement(descriptor: SerialDescriptor, index: number, value: boolean): void
  {
    this.encoder.encodeBooleanElement(descriptor, index, value);
  }

  encodeUint8Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encoder.encodeUint8Element(descriptor, index, value);
  }

  encodeUint16Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encoder.encodeUint16Element(descriptor, index, value);
  }

  encodeUint32Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encoder.encodeUint32Element(descriptor, index, value);
  }

  encodeInt8Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encoder.encodeInt8Element(descriptor, index, value);
  }

  encodeInt16Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encoder.encodeInt16Element(descriptor, index, value);
  }

  encodeInt32Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encoder.encodeInt32Element(descriptor, index, value);
  }

  encodeFloat32Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encoder.encodeFloat32Element(descriptor, index, value);
  }

  encodeFloat64Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encoder.encodeFloat64Element(descriptor, index, value);
  }

  encodeStringElement(descriptor: SerialDescriptor, index: number, value: string): void
  {
    this.encoder.encodeStringElement(descriptor, index, value);
  }

  encodeDDSElement(descriptor: SerialDescriptor, index: number, value: DDS): void
  {
    this.trackObject(value);
    this.encoder.encodeDDSElement(descriptor, index, value);
  }
}
