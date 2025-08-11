import type { ISerializationStrategy } from "../types.js";
import type { ICompositeEncoder, IEncoder } from "./IEncoder.js";
import type { DDS } from "../../dds/DDS.js";

export abstract class AbstractEncoder implements IEncoder
{
  protected constructor()
  {
  }

  public encodeValue(value: unknown)
  {
    throw new Error("Cannot serialize value");
  }

  public encodeNotNullMark(): void
  {
  }

  public encodeNull(): void
  {
    this.encodeValue(null);
  }

  public encodeBoolean(value: boolean): void
  {
    this.encodeValue(value);
  }

  public encodeUint8(value: number): void
  {
    this.encodeValue(value);
  }

  public encodeUint16(value: number): void
  {
    this.encodeValue(value);
  }

  public encodeUint32(value: number): void
  {
    this.encodeValue(value);
  }

  public encodeInt8(value: number): void
  {
    this.encodeValue(value);
  }

  public encodeInt16(value: number): void
  {
    this.encodeValue(value);
  }

  public encodeInt32(value: number): void
  {
    this.encodeValue(value);
  }

  public encodeFloat32(value: number): void
  {
    this.encodeValue(value);
  }

  public encodeFloat64(value: number): void
  {
    this.encodeValue(value);
  }

  public encodeString(value: string): void
  {
    this.encodeValue(value);
  }

  public encodeDDS(value: DDS): void
  {
    this.encodeValue(value);
  }

  encodeSerializableValue<T>(serializer: ISerializationStrategy<T>, value: T): void
  {
    serializer.serialize(this, value);
  }

  abstract encodeObject(encode: (encoder: ICompositeEncoder) => void): void;

  abstract encodeSparseObject(size: number, encode: (encoder: ICompositeEncoder) => void): void;

  abstract encodeArray(length: number, encode: (encoder: IEncoder) => void): void;
}
