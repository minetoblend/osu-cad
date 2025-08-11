import type { SerialDescriptor } from "../../serialization/descriptor/SerialDescriptor.js";
import type { ObjectDDS } from "./ObjectDDS.js";
import type { ObjectDDSPropertyMetadata } from "./metadata.js";
import { getObjectDDSProperties } from "./decorator.js";
import { SerialKind } from "src/serialization/descriptor/SerialKind.js";

export class ObjectDDSDescriptor implements SerialDescriptor
{
  static readonly #descriptorMap = new Map<any, ObjectDDSDescriptor>();

  static for(dds: ObjectDDS): ObjectDDSDescriptor
  {
    let descriptor = this.#descriptorMap.get(dds.constructor);

    if (!descriptor)
      this.#descriptorMap.set(dds.constructor, descriptor = new ObjectDDSDescriptor(dds));

    return descriptor;
  }

  readonly properties: ObjectDDSPropertyMetadata[];

  constructor(target: ObjectDDS)
  {
    this.properties = getObjectDDSProperties(target);
  }

  kind = SerialKind.Object;

  get elementCount(): number
  {
    return this.properties.length;
  }

  getElementName(index: number): string
  {
    return this.properties[index].name;
  }

  getElementIndex(name: string): number
  {
    return this.properties.findIndex(it => it.name === name);
  }

  getElementDescriptor(index: number): SerialDescriptor
  {
    return this.properties[index].serializer.descriptor;
  }
}
