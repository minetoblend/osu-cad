import type { SerialDescriptor } from '../descriptor/SerialDescriptor';
import type { SerializationStrategy } from '../Serializer';
import type { CompositeEncoder, Encoder } from './Encoder';
import { BaseEncoder } from './BaseEncoder';

export abstract class TaggedEncoder<Tag> extends BaseEncoder implements Encoder, CompositeEncoder {
  abstract getTag(descriptor: SerialDescriptor, index: number): Tag;

  protected encodeTaggedValue(tag: Tag, value: any) {
    throw new Error(`Non-serializable ${value} is not supported by ${this.constructor.name} encoder`);
  }

  protected encodeTaggedNonNullMark(tag: Tag) {
  }

  protected encodeTaggedNull(tag: Tag) {
    throw new Error('Null is not supported');
  }

  protected encodeTaggedBoolean(tag: Tag, value: boolean) {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedUint8(tag: Tag, value: number) {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedUint16(tag: Tag, value: number) {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedUint32(tag: Tag, value: number) {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedInt8(tag: Tag, value: number) {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedInt16(tag: Tag, value: number) {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedInt32(tag: Tag, value: number) {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedFloat32(tag: Tag, value: number) {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedFloat64(tag: Tag, value: number) {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeTaggedString(tag: Tag, value: string) {
    this.encodeTaggedValue(tag, value);
  }

  protected encodeElement(desc: SerialDescriptor, index: number): boolean {
    const tag = this.getTag(desc, index);
    this.pushTag(tag);
    return true;
  }

  override encodeNotNullMark() {
    this.encodeTaggedNonNullMark(this.currentTag);
  }

  override encodeNull() {
    this.encodeTaggedNull(this.popTag());
  }

  override encodeBoolean(value: boolean) {
    this.encodeTaggedBoolean(this.popTag(), value);
  }

  override encodeUint8(value: number) {
    this.encodeTaggedUint8(this.popTag(), value);
  }

  override encodeUint16(value: number) {
    this.encodeTaggedUint16(this.popTag(), value);
  }

  override encodeUint32(value: number) {
    this.encodeTaggedUint32(this.popTag(), value);
  }

  override encodeInt8(value: number) {
    this.encodeTaggedInt8(this.popTag(), value);
  }

  override encodeInt16(value: number) {
    this.encodeTaggedInt16(this.popTag(), value);
  }

  override encodeInt32(value: number) {
    this.encodeTaggedInt32(this.popTag(), value);
  }

  override encodeFloat32(value: number) {
    this.encodeTaggedFloat32(this.popTag(), value);
  }

  override encodeFloat64(value: number) {
    this.encodeTaggedFloat64(this.popTag(), value);
  }

  override encodeString(value: string) {
    this.encodeTaggedString(this.popTag(), value);
  }

  override beginStructure(descriptor: SerialDescriptor): CompositeEncoder {
    return this;
  }

  override endStructure(descriptor: SerialDescriptor) {
    if (this.tagStack.length > 0)
      this.popTag();
    this.endEncode(descriptor);
  }

  protected endEncode(descriptor: SerialDescriptor) {
  }

  encodeBooleanElement(descriptor: SerialDescriptor, index: number, value: boolean) {
    this.encodeTaggedBoolean(this.getTag(descriptor, index), value);
  }

  encodeUint8Element(descriptor: SerialDescriptor, index: number, value: number) {
    this.encodeTaggedUint8(this.getTag(descriptor, index), value);
  }

  encodeUint16Element(descriptor: SerialDescriptor, index: number, value: number) {
    this.encodeTaggedUint16(this.getTag(descriptor, index), value);
  }

  encodeUint32Element(descriptor: SerialDescriptor, index: number, value: number) {
    this.encodeTaggedUint32(this.getTag(descriptor, index), value);
  }

  encodeInt8Element(descriptor: SerialDescriptor, index: number, value: number) {
    this.encodeTaggedInt8(this.getTag(descriptor, index), value);
  }

  encodeInt16Element(descriptor: SerialDescriptor, index: number, value: number) {
    this.encodeTaggedInt16(this.getTag(descriptor, index), value);
  }

  encodeInt32Element(descriptor: SerialDescriptor, index: number, value: number) {
    this.encodeTaggedInt32(this.getTag(descriptor, index), value);
  }

  encodeFloat32Element(descriptor: SerialDescriptor, index: number, value: number) {
    this.encodeTaggedFloat32(this.getTag(descriptor, index), value);
  }

  encodeFloat64Element(descriptor: SerialDescriptor, index: number, value: number) {
    this.encodeTaggedFloat64(this.getTag(descriptor, index), value);
  }

  encodeStringElement(descriptor: SerialDescriptor, index: number, value: string) {
    this.encodeTaggedString(this.getTag(descriptor, index), value);
  }

  encodeSerializableElement<T>(descriptor: SerialDescriptor, index: number, serializer: SerializationStrategy<T>, value: T) {
    if (this.encodeElement(descriptor, index)) {
      this.encodeSerializableValue(serializer, value);
    }
  }

  encodeNullableSerializableElement<T>(descriptor: SerialDescriptor, index: number, serializer: SerializationStrategy<T>, value: T | null) {
    if (this.encodeElement(descriptor, index))
      this.encodeNullableSerializableValue(serializer, value);
  }

  private tagStack: Tag[] = [];

  protected get currentTag() {
    return this.tagStack[this.tagStack.length - 1];
  }

  protected get currentTagOrNull() {
    return this.tagStack.length > 0 ? this.currentTag : null;
  }

  protected pushTag(tag: Tag) {
    this.tagStack.push(tag);
  }

  protected popTag(): Tag {
    if (this.tagStack.length === 0) {
      throw new Error('No tag to pop');
    }
    return this.tagStack.pop();
  }
}
