import type { ObjectDDS } from "./ObjectDDS.js";
import type { ObjectDDSPropertyMetadata } from "./metadata.js";
import { metadataKey, propertiesKey } from "./metadata.js";
import type { ISerializer } from "../../serialization/types.js";
import { primitiveDescriptor } from "../../serialization/descriptor/PrimitiveDescriptor.js";
import { NullableSerializer } from "../../serialization/NullableSerializer.js";

export type AccessorDecorator<This, Value> = (
  target: ClassAccessorDecoratorTarget<This, Value>,
  context: ClassAccessorDecoratorContext<This, Value>,
) => ClassAccessorDecoratorResult<This, Value>;

export function getObjectDDSProperties(dds: ObjectDDS)
{
  const metadata = (dds.constructor as any)[metadataKey];

  return (metadata?.[propertiesKey] ?? []) as ObjectDDSPropertyMetadata[];
}

export interface TypeDecoratorOptions
{
  nullable?: boolean
  since?: number
}

export function typeDecorator<This extends ObjectDDS, Value>(serializer: ISerializer<Value>, options: TypeDecoratorOptions): AccessorDecorator<This, Value>
{
  return ({ get, set }, context) =>
  {
    const properties = (context.metadata[propertiesKey] ?? []) as ObjectDDSPropertyMetadata[];

    const index = properties.length;

    context.metadata[propertiesKey] = [...properties, {
      name: context.name,
      index,
      get(target: This)
      {
        return get.call(target);
      },
      set(target: This, value: unknown)
      {
        set.call(target, value as Value);
      },
      serializer,
      nullable: options.nullable,
      since: options.since,
    }];

    return {
      get(): Value
      {
        return get.call(this);
      },
      set(value: Value): void
      {
        set.call(this, value);
      },
    };
  };
}

export type SerializerMap = { [key: string]: ISerializer<any> };

export interface ISerializerOptions<This, Value, Nullable extends boolean = false>
{
  nullable?: Nullable;
  since?: number
}

export type UnwrapSerializer<T> = T extends ISerializer<infer U> ? U : never;

export function createTypeDecorator<T extends SerializerMap>(serializers: T)
{
  return function <This extends ObjectDDS, Key extends keyof T, Nullable extends boolean = false>(key: Key, options: ISerializerOptions<This, UnwrapSerializer<T[Key]>, Nullable> = {}):
      Nullable extends true
          ? AccessorDecorator<This, UnwrapSerializer<T[Key]> | null>
          : AccessorDecorator<This, UnwrapSerializer<T[Key]>>
  {
    let serializer: ISerializer<any> = serializers[key];

    if (options.nullable)
      serializer = new NullableSerializer(serializer);

    return typeDecorator(serializer, options);
  };
}

export const builtinTypes = {
  boolean: {
    descriptor: primitiveDescriptor,
    serialize: (encoder, value) => encoder.encodeBoolean(value),
    deserialize: decoder => decoder.decodeBoolean(),
  },
  uint8: {
    descriptor: primitiveDescriptor,
    serialize: (encoder, value) => encoder.encodeUint8(value),
    deserialize: decoder => decoder.decodeUint8(),
  },
  uint16: {
    descriptor: primitiveDescriptor,
    serialize: (encoder, value) => encoder.encodeUint16(value),
    deserialize: decoder => decoder.decodeUint16(),
  },
  uint32: {
    descriptor: primitiveDescriptor,
    serialize: (encoder, value) => encoder.encodeUint32(value),
    deserialize: decoder => decoder.decodeUint32(),
  },
  int8: {
    descriptor: primitiveDescriptor,
    serialize: (encoder, value) => encoder.encodeInt8(value),
    deserialize: decoder => decoder.decodeInt8(),
  },
  int16: {
    descriptor: primitiveDescriptor,
    serialize: (encoder, value) => encoder.encodeInt16(value),
    deserialize: decoder => decoder.decodeInt16(),
  },
  int32: {
    descriptor: primitiveDescriptor,
    serialize: (encoder, value) => encoder.encodeInt32(value),
    deserialize: decoder => decoder.decodeInt32(),
  },
  float32: {
    descriptor: primitiveDescriptor,
    serialize: (encoder, value) => encoder.encodeFloat32(value),
    deserialize: decoder => decoder.decodeFloat32(),
  },
  float64: {
    descriptor: primitiveDescriptor,
    serialize: (encoder, value) => encoder.encodeFloat64(value),
    deserialize: decoder => decoder.decodeFloat64(),
  },
  string: {
    descriptor: primitiveDescriptor,
    serialize: (encoder, value) => encoder.encodeString(value),
    deserialize: decoder => decoder.decodeString(),
  },
} satisfies SerializerMap;

export const type = createTypeDecorator(builtinTypes);
