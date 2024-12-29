import type { SerialDescriptor } from '../descriptor/SerialDescriptor';
import type { CompositeEncoder } from '../encoder/Encoder';
import type { SerializationStrategy } from '../Serializer';
import type { Json } from './Json';
import type { JsonElement } from './JsonElement';
import { StructureKind } from '../descriptor/SerialKind';
import { NamedValueEncoder } from '../encoder/NamedValueEncoder';
import { AbstractPolymorphicSerializer } from '../PolymorphicSerializer';

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

  override encodeNotNullMark() {
  }

  override encodeNull() {
    const tag = this.currentTagOrNull;
    if (!tag)
      return this.nodeConsumer(null);
    this.encodeTaggedNull(tag);
  }

  protected override encodeTaggedNull(tag: string) {
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
    if (this.currentTagOrNull !== null) {
      this.encodePolymorphically(serializer, value, (discriminatorName, serialName) => {
        this.polymorphicDiscriminator = discriminatorName;
        this.polymorphicSerialName = serialName;
      });
    }
    else {
      serializer.serialize(this, value);
    }
  }

  protected override encodeTaggedValue(tag: string, value: any) {
    this.putElement(tag, value.toString());
  }

  private polymorphicDiscriminator: string | null = null;
  private polymorphicSerialName: string | null = null;

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

    const discriminator = this.polymorphicDiscriminator;
    if (discriminator !== null) {
      // TODO: handle Map case
      encoder.putElement(discriminator, this.polymorphicSerialName ?? descriptor.serialName);
    }

    return encoder;
  }

  protected override endEncode(descriptor: SerialDescriptor) {
    this.nodeConsumer(this.getCurrent());
  }

  private encodePolymorphically<T>(serializer: SerializationStrategy<T>, value: T, ifPolymorphic: (discriminatorName: string, serialName: string) => void) {
    const needDiscriminator = serializer instanceof AbstractPolymorphicSerializer;
    const baseClassDiscriminator = needDiscriminator ? this.json.configuration.classDiscriminator : null;

    let actualSerializer: SerializationStrategy<T> = serializer;
    if (needDiscriminator) {
      const casted = serializer as AbstractPolymorphicSerializer<T>;
      actualSerializer = casted.findPolymorphicSerializer(this, value);
      // TODO: further checks
    }

    if (baseClassDiscriminator !== null)
      ifPolymorphic(baseClassDiscriminator, actualSerializer.descriptor.serialName);

    actualSerializer.serialize(this, value);
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
