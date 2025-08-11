import type { ICompositeDecoder } from "../decoding/IDecoder.js";
import type { JsonElement } from "./JsonElement.js";
import type { IDeserializationStrategy } from "../types.js";
import { JsonDecoder } from "./JsonDecoder.js";
import type { SerialDescriptor } from "../descriptor/SerialDescriptor.js";

export class JsonObjectDecoder implements ICompositeDecoder
{
  constructor(readonly object: Record<string, JsonElement>)
  {
  }

  protected getValue(descriptor: SerialDescriptor, index: number)
  {
    return this.object[descriptor.getElementName(index)];
  }

  public decodeBooleanElement(descriptor: SerialDescriptor, index: number): boolean
  {
    const value = this.getValue(descriptor, index);
    if (typeof value !== "boolean")
      throw new Error("Invalid type");

    return value;
  }

  public decodeNumberElement(descriptor: SerialDescriptor, index: number)
  {
    const value = this.getValue(descriptor, index);
    if (typeof value !== "number")
      throw new Error("Invalid type");

    return value;
  }

  public decodeUint8Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeNumberElement(descriptor, index);
  }

  public decodeUint16Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeNumberElement(descriptor, index);
  }

  public decodeUint32Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeNumberElement(descriptor, index);
  }

  public decodeInt8Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeNumberElement(descriptor, index);
  }

  public decodeInt16Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeNumberElement(descriptor, index);
  }

  public decodeInt32Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeNumberElement(descriptor, index);
  }

  public decodeFloat32Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeNumberElement(descriptor, index);
  }

  public decodeFloat64Element(descriptor: SerialDescriptor, index: number): number
  {
    return this.decodeNumberElement(descriptor, index);
  }

  public decodeStringElement(descriptor: SerialDescriptor, index: number): string
  {
    const value = this.getValue(descriptor, index);
    if (typeof value !== "string")
      throw new Error("Invalid type");

    return value;
  }

  decodeSerializableElement<T>(descriptor: SerialDescriptor, index: number, serializer: IDeserializationStrategy<T>): T
  {
    const value = this.getValue(descriptor, index);

    return serializer.deserialize(new JsonDecoder(value));
  }
}
