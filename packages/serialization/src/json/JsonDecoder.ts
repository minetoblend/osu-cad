import type { SerialDescriptor } from '../descriptor/SerialDescriptor';
import type { DeserializationStrategy } from '../Serializer';
import type { Json } from './Json';
import type { JsonElement, JsonPrimitive } from './JsonElement';
import { BooleanSerializer } from '../builtins/BuiltinSerializers';
import { CompositeDecoder } from '../decoder/Decoder';
import { NamedValueDecoder } from '../decoder/TaggedDecoder';
import { PolymorphicKind, StructureKind } from '../descriptor/SerialKind';
import { AbstractPolymorphicSerializer } from '../PolymorphicSerializer';

export abstract class AbstractJsonTreeDecoder extends NamedValueDecoder {
  constructor(
    protected readonly json: Json,
    protected readonly value: JsonElement,
    protected readonly polymorphicDiscriminator: string | null = null,
  ) {
    super();
  }

  currentObject() {
    const tag = this.currentTagOrNull;
    if (tag === null)
      return this.value;
    return this.currentElement(tag);
  }

  override decodeSerializableValue<T>(deserializer: DeserializationStrategy<T>, previousValue?: T | undefined): T {
    return this.decodeSerializableValuePolymorphic(deserializer);
  }

  decodeSerializableValuePolymorphic<T>(deserializer: DeserializationStrategy<T>): T {
    if (!(deserializer instanceof AbstractPolymorphicSerializer) /* || this.json.configuration.useArrayPolymorphism */) {
      return deserializer.deserialize(this);
    }

    const discriminator = this.json.configuration.classDiscriminator;

    const jsonTree = this.decodeJsonElement() as object;
    const type = (jsonTree as any)[discriminator] ?? null;

    const actualSerializer = (deserializer as AbstractPolymorphicSerializer<any>).findPolymorphicSerializerByName(this, type);

    return this.json.readPolymorphicJson(discriminator, jsonTree as any, actualSerializer);
  }

  decodeJsonElement() {
    return this.currentObject();
  }

  protected override composeName(parentName: string, childName: string): string {
    return childName;
  }

  override beginStructure(descriptor: SerialDescriptor): CompositeDecoder {
    const currentObject = this.currentObject();
    if (descriptor.kind === StructureKind.LIST || descriptor.kind instanceof PolymorphicKind) {
      return new JsonListDecoder(this.json, currentObject as Array<JsonElement>, this.polymorphicDiscriminator);
    }
    // TODO: Map decoding
    return new JsonTreeDecoder(this.json, currentObject, this.polymorphicDiscriminator);
  }

  override endStructure(descriptor: SerialDescriptor) {
    // nothing
  }

  override decodeNotNullMark(): boolean {
    const object = this.currentObject();
    return object !== null && object !== undefined;
  }

  getPrimitiveValue<T>(tag: string, descriptor: SerialDescriptor): JsonPrimitive;
  getPrimitiveValue<T>(tag: string, descriptor: SerialDescriptor, convert: (value: JsonPrimitive) => T): T;
  getPrimitiveValue<T>(tag: string, descriptor: SerialDescriptor, convert?: (value: JsonPrimitive) => T): T {
    const literal = this.currentElement(tag);
    if (convert) {
      return convert(literal as JsonPrimitive);
    }
    return literal as unknown as T;
  }

  protected abstract currentElement(tag: string): JsonElement;

  override decodeTaggedNull(tag: string): null {
    return null;
  }

  override decodeTaggedNotNullMark(tag: string): boolean {
    return this.currentElement(tag) !== null;
  }

  override decodeTaggedBoolean(tag: string): boolean {
    // TODO: check if it's a boolean
    return this.getPrimitiveValue(tag, BooleanSerializer.descriptor, (value) => {
      if (typeof value === 'boolean')
        return value;
      if (value === 'true')
        return true;
      if (value === 'false')
        return false;

      throw new Error(`Expected a boolean, got ${value}`);
    }) as boolean;
  }

  override decodeTaggedUint8(tag: string): number {
    return this.getPrimitiveValue(tag, BooleanSerializer.descriptor, (value) => {
      if (typeof value === 'number')
        return value;

      throw new Error(`Expected a number, got ${value}`);
    }) as number;
  }

  override decodeTaggedUint16(tag: string): number {
    return this.getPrimitiveValue(tag, BooleanSerializer.descriptor, (value) => {
      if (typeof value === 'number')
        return value;

      throw new Error(`Expected a number, got ${value}`);
    }) as number;
  }

  override decodeTaggedUint32(tag: string): number {
    return this.getPrimitiveValue(tag, BooleanSerializer.descriptor, (value) => {
      if (typeof value === 'number')
        return value;

      throw new Error(`Expected a number, got ${value}`);
    }) as number;
  }

  override decodeTaggedInt8(tag: string): number {
    return this.getPrimitiveValue(tag, BooleanSerializer.descriptor, (value) => {
      if (typeof value === 'number')
        return value;

      throw new Error(`Expected a number, got ${value}`);
    }) as number;
  }

  override decodeTaggedInt16(tag: string): number {
    return this.getPrimitiveValue(tag, BooleanSerializer.descriptor, (value) => {
      if (typeof value === 'number')
        return value;

      throw new Error(`Expected a number, got ${value}`);
    }) as number;
  }

  override decodeTaggedInt32(tag: string): number {
    return this.getPrimitiveValue(tag, BooleanSerializer.descriptor, (value) => {
      if (typeof value === 'number')
        return value;

      throw new Error(`Expected a number, got ${value}`);
    }) as number;
  }

  override decodeTaggedFloat32(tag: string): number {
    return this.getPrimitiveValue(tag, BooleanSerializer.descriptor, (value) => {
      if (typeof value === 'number')
        return value;

      throw new Error(`Expected a number, got ${value}`);
    }) as number;
  }

  override decodeTaggedFloat64(tag: string): number {
    return this.getPrimitiveValue(tag, BooleanSerializer.descriptor, (value) => {
      if (typeof value === 'number')
        return value;

      throw new Error(`Expected a number, got ${value}`);
    }) as number;
  }

  override decodeTaggedString(tag: string): string {
    return this.getPrimitiveValue(tag, BooleanSerializer.descriptor, (value) => {
      if (typeof value === 'string')
        return value;

      throw new Error(`Expected a string, got ${value}`);
    }) as string;
  }
}

const PRIMITIVE_TAG = 'primitive';

class JsonPrimitiveDecoder extends AbstractJsonTreeDecoder {
  constructor(json: Json, value: JsonElement, polymorphismDiscriminator: string | null) {
    super(json, value, polymorphismDiscriminator);
    this.pushTag(PRIMITIVE_TAG);
  }

  override decodeElementIndex(descriptor: SerialDescriptor): number {
    return 0;
  }

  protected override currentElement(tag: string): JsonElement {
    console.assert(tag === PRIMITIVE_TAG, 'Expected a primitive tag');
    return this.value;
  }
}

export class JsonTreeDecoder extends AbstractJsonTreeDecoder {
  private position = 0;
  private forceNull = false;

  constructor(
    json: Json,
    value: JsonElement,
    polymorphicDiscriminator: string | null = null,
    readonly polyDescriptor: SerialDescriptor | null = null,
  ) {
    super(json, value, polymorphicDiscriminator);
  }

  override decodeElementIndex(descriptor: SerialDescriptor): number {
    while (this.position < descriptor.elementsCount) {
      const name = descriptor.getElementName(this.position++);
      const index = this.position - 1;
      this.forceNull = false;
      console.log({
        name,
        value: this.value,
      });
      if ((name in (this.value as any) || this.absenceIsNull(descriptor, index))
      // && (!configuration.coerceInputValues || !coerceInputValue(descriptor, index, name))
      ) {
        return index;
      }
    }

    return CompositeDecoder.DECODE_DONE;
  }

  private absenceIsNull(descriptor: SerialDescriptor, index: number): boolean {
    this.forceNull = !descriptor.isElementOptional(index) && descriptor.getElementDescriptor(index).isNullable;
    return this.forceNull;
  }

  override decodeNotNullMark(): boolean {
    return !this.forceNull && super.decodeNotNullMark();
  }

  protected override elementName(descriptor: SerialDescriptor, index: number): string {
    const baseName = descriptor.getElementName(index);

    // TODO: custom names

    return baseName;
  }

  protected override currentElement(tag: string): JsonElement {
    return (this.value as any)[tag];
  }

  override beginStructure(descriptor: SerialDescriptor): CompositeDecoder {
    if (descriptor === this.polyDescriptor) {
      return new JsonTreeDecoder(
        this.json,
        this.currentObject(),
        this.polymorphicDiscriminator,
        this.polyDescriptor,
      );
    }

    return super.beginStructure(descriptor);
  }

  override endStructure(descriptor: SerialDescriptor) {
    // nothing
  }
}

export class JsonListDecoder extends AbstractJsonTreeDecoder {
  declare value: Array<JsonElement>;

  private readonly length = this.value.length;
  private currentIndex = -1;

  decodeElementIndex(descriptor: SerialDescriptor): number {
    return this.currentIndex++;
  }

  protected currentElement(tag: string): JsonElement {
    return this.value[Number.parseInt(tag)];
  }

  override decodeCollectionSize(descriptor: SerialDescriptor): number {
    return this.length;
  }
}
