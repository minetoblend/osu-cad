import type { SerialDescriptor } from '../descriptor/SerialDescriptor';
import type { CompositeEncoder } from '../encoder/Encoder';
import type { SerializationStrategy } from '../Serializer';
import type { Json } from './Json';
import type { JsonElement } from './JsonElement';
import { StructureKind } from '../descriptor/SerialKind';
import { NamedValueEncoder } from '../encoder/NamedValueEncoder';

export abstract class JsonEncoder extends NamedValueEncoder {
  constructor(
    protected json: Json,
    protected readonly nodeConsumer: (node: JsonElement) => void,
  ) {
    super();
  }

  protected override composeName(parentName: string, childName: string): string {
    return childName;
  }

  protected abstract putElement(tag: string, element: JsonElement): void;

  protected abstract getCurrent(): JsonElement;

  encodeNotNullMark() {
  }

  encodeNull() {
    const tag = this.currentTagOrNull;
    if (!tag)
      return this.nodeConsumer(null);
    this.encodeTaggedNull(tag);
  }

  protected override encodeTaggedNull(tag: string) {
    super.encodeTaggedNull(tag);
    this.putElement(tag, null);
  }

  protected override encodeTaggedBoolean(tag: string, value: boolean) {
    this.putElement(tag, value);
  }

  protected override encodeTaggedUint8(tag: string, value: number) {
    this.putElement(tag, value);
  }

  protected override encodeTaggedUint16(tag: string, value: number) {
    this.putElement(tag, value);
  }

  protected override encodeTaggedUint32(tag: string, value: number) {
    this.putElement(tag, value);
  }

  protected override encodeTaggedInt8(tag: string, value: number) {
    this.putElement(tag, value);
  }

  protected override encodeTaggedInt16(tag: string, value: number) {
    this.putElement(tag, value);
  }

  protected override encodeTaggedInt32(tag: string, value: number) {
    this.putElement(tag, value);
  }

  protected override encodeTaggedFloat32(tag: string, value: number) {
    this.putElement(tag, value);
  }

  protected override encodeTaggedFloat64(tag: string, value: number) {
    this.putElement(tag, value);
  }

  protected override encodeTaggedString(tag: string, value: string) {
    this.putElement(tag, value);
  }

  override encodeSerializableValue<T>(serializer: SerializationStrategy<T>, value: T) {
    if (this.currentTagOrNull != null) {
      // TODO: polymorphic discriminator
      serializer.serialize(this, value);
    }
    else {
      serializer.serialize(this, value);
    }
    // TODO
  }

  protected override encodeTaggedValue(tag: string, value: any) {
    this.putElement(tag, value.toString());
  }

  override beginStructure(descriptor: SerialDescriptor): CompositeEncoder {
    const consumer
      = this.currentTagOrNull === null
        ? this.nodeConsumer
        : (node: JsonElement) => this.putElement(this.currentTagOrNull!, node);

    let encoder: JsonEncoder;

    if (descriptor.kind === StructureKind.LIST)
      encoder = new JsonTreeListEncoder(this.json, consumer);
    // TODO: case StructureKind.MAP
    else
      encoder = new JsonTreeEncoder(this.json, consumer);

    // TODO: polymorphic discriminator

    return encoder;
  }

  protected override endEncode(descriptor: SerialDescriptor) {
    this.nodeConsumer(this.getCurrent());
  }
}

export class JsonTreeEncoder extends JsonEncoder {
  protected readonly content: Record<string, JsonElement> = {};

  protected putElement(tag: string, element: JsonElement): void {
    this.content[tag] = element;
  }

  protected getCurrent(): JsonElement {
    return this.content;
  }
}

export class JsonTreeListEncoder extends JsonEncoder {
  protected readonly content: JsonElement[] = [];

  protected override elementName(descriptor: SerialDescriptor, index: number): string {
    return index.toString();
  }

  protected putElement(tag: string, element: JsonElement): void {
    const index = Number.parseInt(tag);
    if (index === this.content.length)
      this.content.push(element);
    else
      this.content.splice(index, 0, element);
  }

  protected getCurrent(): JsonElement {
    return this.content;
  }
}
