import type { ObjectDDS } from "./ObjectDDS.js";
import type { ISerializer } from "../../serialization/types.js";
import type { SerialDescriptor } from "../../serialization/descriptor/SerialDescriptor.js";
import type { IEncoder } from "../../serialization/encoding/IEncoder.js";
import type { IDecoder } from "../../serialization/decoding/IDecoder.js";
import { getObjectDDSProperties } from "./decorator.js";

export class ObjectDelta
{
  constructor(
    readonly target: ObjectDDS,
    readonly entries: ObjectDeltaEntry[],
  )
  {
  }
}

export interface ObjectDeltaEntry
{
  property: number
  value: unknown
}

export class ObjectDeltaSerializer implements ISerializer<ObjectDelta>
{
  constructor(readonly target: ObjectDDS)
  {
    this.descriptor = target.descriptor;
  }

  readonly descriptor: SerialDescriptor;

  public serialize(encoder: IEncoder, value: ObjectDelta): void
  {
    const properties = getObjectDDSProperties(this.target);

    encoder.encodeSparseObject(value.entries.length, encoder =>
    {
      for (const entry of value.entries)
      {
        const property = properties[entry.property];

        encoder.encodeSerializableElement(this.descriptor, property.index, property.serializer, entry.value);
      }
    });
  }

  public deserialize(decoder: IDecoder): ObjectDelta
  {
    const entries: ObjectDeltaEntry[] = [];
    const properties = getObjectDDSProperties(this.target);

    decoder.decodeSparseObject((size, decoder) =>
    {
      for (let i = 0; i < size; i++)
      {
        const index = decoder.decodeElementIndex(this.descriptor);

        const property = properties[index];

        const value = decoder.decodeSerializableElement(this.descriptor, index, property.serializer);

        entries.push({ property: index, value });
      }
    });

    return new ObjectDelta(this.target, entries);
  }
}
