import type { JsonElement } from "./JsonElement.js";
import type { ICompositeDecoder, IDecoder, ISparseObjectDecoder } from "../decoding/IDecoder.js";
import { JsonDecoder } from "./JsonDecoder.js";
import type { IDeserializationStrategy } from "../types.js";
import { JsonObjectDecoder } from "./JsonObjectDecoder.js";
import { JsonSparseObjectDecoder } from "./JsonSparseObjectDecoder.js";

export class JsonArrayDecoder implements IDecoder
{
  constructor(
    readonly elements: JsonElement[],
  )
  {
  }

  #index = 0;

  protected decoder = new JsonDecoder(null);

  protected get currentElement()
  {
    return this.elements[this.#index];
  }

  protected advance()
  {
    this.#index++;
  }

  public decodeNotNullMark(): boolean
  {
    return this.currentElement !== null;
  }

  public decodeNull(): null
  {
    if (this.currentElement !== null)
      throw new Error("Found invalid type");

    return null;
  }

  public decodeBoolean(): boolean
  {
    if (typeof this.currentElement !== "boolean")
      throw new Error("Found invalid type");

    return this.currentElement as boolean;
  }

  public decodeNumber(): number
  {
    if (typeof this.currentElement !== "number")
      throw new Error("Found invalid type");

    return this.currentElement;
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
    if (typeof this.currentElement !== "string")
      throw new Error("Unexpected type");

    return this.currentElement;
  }

  public decodeSerializableValue<T>(serializer: IDeserializationStrategy<T>): T
  {
    return serializer.deserialize(new JsonDecoder(this.currentElement));
  }

  decodeObject<T>(decode: (decoder: ICompositeDecoder) => T): T
  {
    const decoder = new JsonObjectDecoder(this.currentElement as Record<string, JsonElement>);

    return decode(decoder);
  }

  decodeSparseObject<T>(decode: (size: number, decoder: ISparseObjectDecoder) => T): T
  {
    const decoder = new JsonSparseObjectDecoder(this.currentElement as Record<string, JsonElement>);

    return decode(Object.keys(decoder.object).length, decoder);
  }

  decodeArray<T>(decode: (length: number, decoder: IDecoder) => T): T
  {
    const decoder = new JsonArrayDecoder(this.currentElement as JsonElement[]);

    return decode(decoder.elements.length, decoder);
  }
}
