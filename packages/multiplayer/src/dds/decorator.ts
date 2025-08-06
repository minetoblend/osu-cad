import type { Serializer } from "../serialization/Serializer";
import { Vec2 } from "@osucad/framework";
import type { ObjectDDS, PropertyMetadata } from "./ObjectDDS";
import { propertiesKey } from "./ObjectDDS";
import { NullableSerializer } from "../serialization/NullableSerializer";
import * as uuid from "uuid";

export const metadataKey = Symbol.for("Symbol.metadata");

export type SerializerMap = {
  [key: string]: Serializer<any>
};

export function getObjectDDSProperties(target: ObjectDDS): PropertyMetadata[]
{
  return (target.constructor as {
    [metadataKey]?: { [propertiesKey]?: PropertyMetadata[] }
  })[metadataKey]?.[propertiesKey] ?? [];
}

export type UnwrapSerializer<T> = T extends Serializer<infer U> ? U : never;

export interface SerializerOptions<This, Value, Nullable extends boolean = false>
{
  nullable?: Nullable;
}

type TypeDecorator<This, Value> = (
  target: ClassAccessorDecoratorTarget<This, Value>,
  context: ClassAccessorDecoratorContext<This, Value>,
) => ClassAccessorDecoratorResult<This, Value>;

function typeDecorator<This extends ObjectDDS, Value>(serializer: Serializer<Value>)
{
  return (
    { get, set }: ClassAccessorDecoratorTarget<This, Value>,
    context: ClassAccessorDecoratorContext<This, Value>,
  ): ClassAccessorDecoratorResult<This, Value> =>
  {
    const properties = (context.metadata[propertiesKey] ?? []) as PropertyMetadata[];

    const index = properties.length;

    context.metadata[propertiesKey] = [...properties, {
      get(this: This)
      {
        return get.call(this);
      },
      set(this: This, value: unknown)
      {
        set.call(this, value as Value);
      },
      serializer,
      index,
    }];

    return {
      set(newValue: Value): void
      {
        const oldValue = get.call(this);

        if (!this.onPropertyChanged(index, oldValue, newValue))
          return;

        set.call(this, newValue);
      },
    };
  };
}

export function createTypeDecorator<T extends SerializerMap>(serializers: T)
{
  return function <This extends ObjectDDS, Key extends keyof T, Nullable extends boolean = false>(key: Key, options: SerializerOptions<This, UnwrapSerializer<T[Key]>, Nullable> = {}):
      Nullable extends true
          ? TypeDecorator<This, UnwrapSerializer<T[Key]> | null>
          : TypeDecorator<This, UnwrapSerializer<T[Key]>>
  {
    return typeDecorator(options.nullable ? new NullableSerializer(serializers[key]) : serializers[key]) as any;
  };
}

export const type = createTypeDecorator({
  uint8: {
    encode: (value, writer) => writer.writeUint8(value),
    decode: reader => reader.readUint8(),
  },
  uint16: {
    encode: (value, writer) => writer.writeUint16(value),
    decode: reader => reader.readUint16(),
  },
  uint32: {
    encode: (value, writer) => writer.writeUint32(value),
    decode: reader => reader.readUint32(),
  },
  int8: {
    encode: (value, writer) => writer.writeInt8(value),
    decode: reader => reader.readInt8(),
  },
  int16: {
    encode: (value, writer) => writer.writeInt16(value),
    decode: reader => reader.readInt16(),
  },
  int32: {
    encode: (value, writer) => writer.writeInt32(value),
    decode: reader => reader.readInt32(),
  },
  varint: {
    encode: (value, writer) => writer.writeVarInt(value),
    decode: reader => reader.readVarInt(),
  },
  float32: {
    encode: (value, writer) => writer.writeFloat32(value),
    decode: reader => reader.readFloat32(),
  },
  float64: {
    encode: (value, writer) => writer.writeFloat64(value),
    decode: reader => reader.readFloat64(),
  },
  boolean: {
    encode: (value, writer) => writer.writeBoolean(value),
    decode: reader => reader.readBoolean(),
  },
  string: {
    encode: (value, writer) => writer.writeString(value),
    decode: reader => reader.readString(),
  },
  vec2: {
    encode: (value: Vec2, writer) => writer.writeFloat32(value.x).writeFloat32(value.y),
    decode: reader => new Vec2(reader.readFloat32(), reader.readFloat32()),
    equals: (a: Vec2, b: Vec2) => a.equals(b),
  },
  uuid: {
    encode: (value: string, writer) =>
    {
      writer.writeUuid(value);
    },
    decode: reader => uuid.stringify(reader.readBytes(16)),
  },
});

export function embedded<This extends ObjectDDS, Value>(serializer: Serializer<Value>)
{
  return typeDecorator(serializer);
}
