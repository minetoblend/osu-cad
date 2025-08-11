import type { DDS } from "src/dds/DDS.js";
import type { SerialDescriptor } from "../descriptor/SerialDescriptor.js";
import type { ISerializationStrategy } from "../types.js";
import type { ICompositeEncoder } from "./IEncoder.js";

export abstract class TaggedEncoder<Tag> implements ICompositeEncoder
{
  protected constructor()
  {
  }

  encodeTaggedValue(tag: Tag, value: unknown)
  {
    throw new Error(`Non-serializable ${value} is not supported by ${this.constructor.name} encoder`);
  }

  protected encodeTaggedNonNullMark(tag: Tag)
  {
  }

  protected encodeTaggedNull(tag: Tag)
  {
    throw new Error("Null is not supported");
  }

  protected encodeTaggedBoolean(tag: Tag, value: boolean)
  {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedUint8(tag: Tag, value: number)
  {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedUint16(tag: Tag, value: number)
  {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedUint32(tag: Tag, value: number)
  {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedInt8(tag: Tag, value: number)
  {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedInt16(tag: Tag, value: number)
  {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedInt32(tag: Tag, value: number)
  {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedFloat32(tag: Tag, value: number)
  {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedFloat64(tag: Tag, value: number)
  {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedString(tag: Tag, value: string)
  {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedDDS(tag: Tag, value: DDS)
  {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeElement(descriptor: SerialDescriptor, index: number): boolean
  {
    const tag = this.getTag(descriptor, index);
    this.pushTag(tag);
    return true;
  }

  protected abstract getTag(descriptor: SerialDescriptor, index: number): Tag;

  protected abstract encodeSerializableValue<T>(serializer: ISerializationStrategy<T>, value: T): void;

  public encodeSerializableElement<T>(descriptor: SerialDescriptor, index: number, serializer: ISerializationStrategy<T>, value: T): void
  {
    if (this.encodeElement(descriptor, index))
      this.encodeSerializableValue(serializer, value);
  }

  encodeBooleanElement(descriptor: SerialDescriptor, index: number, value: boolean): void
  {
    this.encodeTaggedBoolean(this.getTag(descriptor, index), value);
  }

  encodeUint8Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodeTaggedUint8(this.getTag(descriptor, index), value);
  }

  encodeUint16Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodeTaggedUint16(this.getTag(descriptor, index), value);
  }

  encodeUint32Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodeTaggedUint32(this.getTag(descriptor, index), value);
  }

  encodeInt8Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodeTaggedInt8(this.getTag(descriptor, index), value);
  }

  encodeInt16Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodeTaggedInt16(this.getTag(descriptor, index), value);
  }

  encodeInt32Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodeTaggedInt32(this.getTag(descriptor, index), value);
  }

  encodeFloat32Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodeTaggedFloat32(this.getTag(descriptor, index), value);
  }

  encodeFloat64Element(descriptor: SerialDescriptor, index: number, value: number): void
  {
    this.encodeTaggedFloat64(this.getTag(descriptor, index), value);
  }

  encodeStringElement(descriptor: SerialDescriptor, index: number, value: string): void
  {
    this.encodeTaggedString(this.getTag(descriptor, index), value);
  }

  encodeDDSElement(descriptor: SerialDescriptor, index: number, value: DDS): void
  {
    this.encodeTaggedDDS(this.getTag(descriptor, index), value);
  }

  #tagStack: Tag[] = [];

  pushTag(tag: Tag)
  {
    this.#tagStack.push(tag);
  }

  popTag()
  {
    if (this.#tagStack.length === 0)
      throw new Error("No tag to pop");

    return this.#tagStack.pop()!;
  }

  protected get currentTag()
  {
    return this.#tagStack[this.#tagStack.length - 1];
  }

  protected get currentTagOrNull()
  {
    return this.#tagStack.length > 0 ? this.currentTag : null;
  }
}
