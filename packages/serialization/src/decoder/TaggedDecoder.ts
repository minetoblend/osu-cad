import type { SerialDescriptor } from '../descriptor/SerialDescriptor';
import type { DeserializationStrategy } from '../Serializer';
import type { CompositeDecoder } from './Decoder';
import { BaseDecoder } from './BaseDecoder';

export abstract class TaggedDecoder<Tag> extends BaseDecoder {
  abstract getTag(descriptor: SerialDescriptor, index: number): Tag;

  protected decodeTaggedValue(tag: Tag): any {
    throw new Error(`${this.constructor.name} can't retrieve untyped values`);
  }

  decodeTaggedNotNullMark(tag: Tag): boolean {
    return true;
  }

  decodeTaggedNull(tag: Tag): null {
    return null;
  }

  decodeTaggedBoolean(tag: Tag): boolean {
    return this.decodeTaggedValue(tag);
  }

  decodeTaggedUint8(tag: Tag): number {
    return this.decodeTaggedValue(tag);
  }

  decodeTaggedUint16(tag: Tag): number {
    return this.decodeTaggedValue(tag);
  }

  decodeTaggedUint32(tag: Tag): number {
    return this.decodeTaggedValue(tag);
  }

  decodeTaggedInt8(tag: Tag): number {
    return this.decodeTaggedValue(tag);
  }

  decodeTaggedInt16(tag: Tag): number {
    return this.decodeTaggedValue(tag);
  }

  decodeTaggedInt32(tag: Tag): number {
    return this.decodeTaggedValue(tag);
  }

  decodeTaggedFloat32(tag: Tag): number {
    return this.decodeTaggedValue(tag);
  }

  decodeTaggedFloat64(tag: Tag): number {
    return this.decodeTaggedValue(tag);
  }

  decodeTaggedString(tag: Tag): string {
    return this.decodeTaggedValue(tag);
  }

  override decodeNotNullMark(): boolean {
    const tag = this.currentTagOrNull;
    if (!tag)
      return false;
    return this.decodeTaggedNotNullMark(tag);
  }

  override decodeNull(): null {
    return null;
  }

  override decodeBoolean(): boolean {
    return this.decodeTaggedBoolean(this.popTag());
  }

  override decodeUint8(): number {
    return this.decodeTaggedUint8(this.popTag());
  }

  override decodeUint16(): number {
    return this.decodeTaggedUint16(this.popTag());
  }

  override decodeUint32(): number {
    return this.decodeTaggedUint32(this.popTag());
  }

  override decodeInt8(): number {
    return this.decodeTaggedInt8(this.popTag());
  }

  override decodeInt16(): number {
    return this.decodeTaggedInt16(this.popTag());
  }

  override decodeInt32(): number {
    return this.decodeTaggedInt32(this.popTag());
  }

  override decodeFloat32(): number {
    return this.decodeTaggedFloat32(this.popTag());
  }

  override decodeFloat64(): number {
    return this.decodeTaggedFloat64(this.popTag());
  }

  override decodeString(): string {
    return this.decodeTaggedString(this.popTag());
  }

  override beginStructure(descriptor: SerialDescriptor): CompositeDecoder {
    return this;
  }

  override endStructure(descriptor: SerialDescriptor) {
    // nothing
  }

  override decodeBooleanElement(descriptor: SerialDescriptor, index: number): boolean {
    return this.decodeTaggedBoolean(this.getTag(descriptor, index));
  }

  override decodeUint8Element(descriptor: SerialDescriptor, index: number): number {
    return this.decodeTaggedUint8(this.getTag(descriptor, index));
  }

  override decodeUint16Element(descriptor: SerialDescriptor, index: number): number {
    return this.decodeTaggedUint16(this.getTag(descriptor, index));
  }

  override decodeUint32Element(descriptor: SerialDescriptor, index: number): number {
    return this.decodeTaggedUint32(this.getTag(descriptor, index));
  }

  override decodeInt8Element(descriptor: SerialDescriptor, index: number): number {
    return this.decodeTaggedInt8(this.getTag(descriptor, index));
  }

  override decodeInt16Element(descriptor: SerialDescriptor, index: number): number {
    return this.decodeTaggedInt16(this.getTag(descriptor, index));
  }

  override decodeInt32Element(descriptor: SerialDescriptor, index: number): number {
    return this.decodeTaggedInt32(this.getTag(descriptor, index));
  }

  override decodeFloat32Element(descriptor: SerialDescriptor, index: number): number {
    return this.decodeTaggedFloat32(this.getTag(descriptor, index));
  }

  override decodeFloat64Element(descriptor: SerialDescriptor, index: number): number {
    return this.decodeTaggedFloat64(this.getTag(descriptor, index));
  }

  override decodeStringElement(descriptor: SerialDescriptor, index: number): string {
    return this.decodeTaggedString(this.getTag(descriptor, index));
  }

  decodeSerializableElement<T>(descriptor: SerialDescriptor, index: number, deserializer: DeserializationStrategy<T>, previousValue?: T): T {
    return this.tagBlock(this.getTag(descriptor, index), () => this.decodeSerializableValue(deserializer, previousValue));
  }

  decodeNullableSerializableElement<T>(descriptor: SerialDescriptor, index: number, deserializer: DeserializationStrategy<T>, previousValue?: T): T | null {
    return this.tagBlock(this.getTag(descriptor, index), () =>
      this.decodeIfNullable(deserializer, () => this.decodeSerializableValue(deserializer, previousValue)));
  }

  private flag = false;

  private tagBlock<T>(tag: Tag, block: () => T): T {
    this.pushTag(tag);
    const result = block();
    if (!this.flag)
      this.popTag();
    this.flag = false;
    return result;
  }

  private readonly tagStack: Tag[] = [];

  get currentTag(): Tag {
    if (this.tagStack.length === 0)
      throw new Error('No tag in the stack');
    return this.tagStack[this.tagStack.length - 1]!;
  }

  get currentTagOrNull(): Tag | null {
    return this.tagStack[this.tagStack.length - 1] ?? null;
  }

  pushTag(tag: Tag): void {
    this.tagStack.push(tag);
  }

  popTag(): Tag {
    if (this.tagStack.length === 0)
      throw new Error('No tag in the stack');
    this.flag = true;
    return this.tagStack.pop()!;
  }
}

export abstract class NamedValueDecoder extends TaggedDecoder<string> {
  getTag(descriptor: SerialDescriptor, index: number): string {
    return this.nested(this.elementName(descriptor, index));
  }

  protected nested(nestedName: string) {
    return this.composeName(this.currentTagOrNull ?? '', nestedName);
  }

  protected elementName(descriptor: SerialDescriptor, index: number): string {
    return descriptor.getElementName(index);
  }

  protected composeName(parentName: string, childName: string): string {
    if (parentName.length === 0)
      return childName;

    return `${parentName}.${childName}`;
  }
}
