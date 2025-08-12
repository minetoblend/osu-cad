import type { ObjectDDS } from "./ObjectDDS.js";
import type { ObjectDDSPropertyMetadata } from "./metadata.js";
import { getObjectDDSProperties } from "./decorator.js";

export class ObjectDDSMetadata
{
  static readonly #metadataMap = new Map<any, ObjectDDSMetadata>();

  static for(dds: ObjectDDS): ObjectDDSMetadata
  {
    let metadata = this.#metadataMap.get(dds.constructor);

    if (!metadata)
      this.#metadataMap.set(dds.constructor, metadata = new ObjectDDSMetadata(dds));

    return metadata;
  }

  readonly properties: ObjectDDSPropertyMetadata[];

  constructor(target: ObjectDDS)
  {
    this.properties = getObjectDDSProperties(target);
  }
}
