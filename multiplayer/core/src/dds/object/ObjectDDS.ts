import { DDS } from "../DDS.js";
import type { IEncoder } from "../../serialization/encoding/IEncoder.js";
import type { IDecoder } from "../../serialization/decoding/IDecoder.js";
import { ObjectDDSDescriptor } from "./ObjectDDSDescriptor.js";
import type { DDSAttributes } from "../DDSAttributes.js";

export class ObjectDDS extends DDS
{
  readonly descriptor: ObjectDDSDescriptor;

  constructor(attributes: DDSAttributes)
  {
    super(attributes);

    this.descriptor = ObjectDDSDescriptor.for(this);
  }

  override createSummary(encoder: IEncoder)
  {
    const descriptor = this.descriptor;
    const properties = descriptor.properties;

    encoder.encodeObject(struct =>
    {
      for (const { index, serializer, get } of properties)
      {
        const value = get(this);

        struct.encodeSerializableElement(descriptor, index, serializer, value);
      }
    });
  }

  override load(decoder: IDecoder, version: number): void
  {
    if (version > this.attributes.version)
      throw new Error(`Cannot load summary with version ${version} (version=${this.attributes.version})`);

    const descriptor = new ObjectDDSDescriptor(this);
    const properties = descriptor.properties;

    decoder.decodeObject(struct =>
    {
      for (const { index, serializer, set, since } of properties)
      {
        if (since !== undefined && since > version)
          continue;

        const value = struct.decodeSerializableElement(descriptor, index, serializer);

        set(this, value);
      }
    });
  }
}
