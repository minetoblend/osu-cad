import type { ObjectDDS } from "./ObjectDDS.js";
import type { ObjectDDSPropertyMetadata } from "./metadata.js";
import { metadataKey, propertiesKey } from "./metadata.js";
import type { DDS } from "../DDS.js";
import type { ISerializer } from "../../serialization/index.js";
import { plainSerializer, NullableSerializer } from "../../serialization/index.js";
import type { DDSFactory, DDSFactoryOrConstructor } from "../DDSFactory.js";
import { toDDSFactory } from "../DDSFactory.js";
import { Lazy } from "../../utils/Lazy.js";

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
  nullable?: boolean;
  since?: number;
}

export function typeDecorator<This extends ObjectDDS, Value>(serializer: ISerializer<Value>, options: TypeDecoratorOptions = {}): AccessorDecorator<This, Value>
{
  return ({ get, set }, context) =>
  {
    const properties = (context.metadata[propertiesKey] ?? []) as ObjectDDSPropertyMetadata[];

    const index = properties.length;

    if (typeof context.name !== "string")
      throw new Error("Only string properties are supported");

    const property: ObjectDDSPropertyMetadata = {
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
      nullable: options.nullable ?? false,
      since: options.since,
    };

    context.metadata[propertiesKey] = [...properties, property];

    return {
      get(): Value
      {
        return get.call(this);
      },
      set(value: Value): void
      {
        this.setValue(property, value);
        set.call(this, value);
      },
    };
  };
}

export type SerializerMap = { [key: string]: ISerializer<any> };

export interface ISerializerOptions<Nullable extends boolean = false>
{
  nullable?: Nullable;
  since?: number;
}

export type UnwrapSerializer<T> = T extends ISerializer<infer U> ? U : never;

export function createTypeDecorator<T extends SerializerMap>(serializers: T)
{
  return function <This extends ObjectDDS, Key extends keyof T, Nullable extends boolean = false>(type: Key, options: ISerializerOptions<Nullable> = {}):
      Nullable extends true
          ? AccessorDecorator<This, UnwrapSerializer<T[Key]> | null>
          : AccessorDecorator<This, UnwrapSerializer<T[Key]>>
  {
    let serializer: ISerializer<any> = serializers[type];

    if (options.nullable)
      serializer = new NullableSerializer(serializer);

    return typeDecorator(serializer, options);
  };
}

export const builtinTypes = {
  boolean: plainSerializer<boolean>(),
  uint8: plainSerializer<number>(),
  uint16: plainSerializer<number>(),
  uint32: plainSerializer<number>(),
  int8: plainSerializer<number>(),
  int16: plainSerializer<number>(),
  int32: plainSerializer<number>(),
  float32: plainSerializer<number>(),
  float64: plainSerializer<number>(),
  string: plainSerializer<string>(),
} satisfies SerializerMap;

export const type = createTypeDecorator(builtinTypes);

export function nested<This extends ObjectDDS, Value extends DDS<unknown>, Nullable extends boolean = false>(type: DDSFactoryOrConstructor<Value> | (() => DDSFactoryOrConstructor<Value>), options: ISerializerOptions<Nullable> = {}):
    Nullable extends true
        ? AccessorDecorator<This, Value | null>
        : AccessorDecorator<This, Value>
{
  const resolvedType = new Lazy<DDSFactory<Value>>(() =>
  {
    if (typeof type === "function")
    {
      if (!type.toString().startsWith("class"))
        type = (type as () => DDSFactoryOrConstructor<Value>)();
    }

    return toDDSFactory(type as DDSFactoryOrConstructor<Value>);
  });

  const serializer: ISerializer<Value> = {
    serialize: (value: Value, encoder) => encoder.encodeDDS(value),
    deserialize: (value, decoder) =>
    {
      const dds = decoder.decodeDDS(value) as Value;

      if (resolvedType.value.attributes.type !== dds.attributes.type)
        throw new Error(`Unexpected dds type ${JSON.stringify(dds.attributes.type)}. Expected type is ${JSON.stringify(resolvedType.value.attributes.type)}`);

      return dds;
    },
  };

  return typeDecorator((options.nullable ? new NullableSerializer(serializer) : serializer) as any, options) as any;
}
