import type { JsonElement } from "./JsonElement.js";
import type { ICompositeDecoder, IDecoder, ISparseObjectDecoder } from "../decoding/IDecoder.js";
import type { IDeserializationStrategy } from "../types.js";
import { JsonObjectDecoder } from "./JsonObjectDecoder.js";
import { JsonSparseObjectDecoder } from "./JsonSparseObjectDecoder.js";
import { JsonArrayDecoder } from "./JsonArrayDecoder.js";

export class JsonDecoder implements IDecoder
{
  constructor(public value: JsonElement)
  {
  }

  public decodeNotNullMark(): boolean
  {
    return this.value !== null;
  }

  public decodeNull(): null
  {
    if (this.value !== null)
      throw new Error("Found invalid type");

    return null;
  }

  public decodeBoolean(): boolean
  {
    if (typeof this.value !== "boolean")
      throw new Error("Found invalid type");

    return this.value as boolean;
  }

  public decodeNumber(): number
  {
    if (typeof this.value !== "number")
      throw new Error("Found invalid type");

    return this.value;
  }

  public decodeUint8(): number
  {
    return this.decodeNumber();
  }

  public decodeUint16(): number
  {
    return this.decodeNumber();
  }

  public decodeUint32(): number
  {
    return this.decodeNumber();
  }

  public decodeInt8(): number
  {
    return this.decodeNumber();
  }

  public decodeInt16(): number
  {
    return this.decodeNumber();
  }

  public decodeInt32(): number
  {
    return this.decodeNumber();
  }

  public decodeFloat32(): number
  {
    return this.decodeNumber();
  }

  public decodeFloat64(): number
  {
    return this.decodeNumber();
  }

  public decodeString(): string
  {
    if (typeof this.value !== "string")
      throw new Error("Unexpected type");

    return this.value;
  }

  public decodeSerializableValue<T>(serializer: IDeserializationStrategy<T>): T
  {
    return serializer.deserialize(this);
  }

  decodeObject<T>(decode: (decoder: ICompositeDecoder) => T): T
  {
    const decoder = new JsonObjectDecoder(this.value as Record<string, JsonElement>);

    return decode(decoder);
  }

  decodeSparseObject<T>(decode: (size: number, decoder: ISparseObjectDecoder) => T): T
  {
    const decoder = new JsonSparseObjectDecoder(this.value as Record<string, JsonElement>);

    return decode(Object.keys(decoder.object).length, decoder);
  }

  decodeArray<T>(decode: (length: number, decoder: IDecoder) => T): T
  {
    const decoder = new JsonArrayDecoder(this.value as JsonElement[]);

    return decode(decoder.elements.length, decoder);
  }
}
