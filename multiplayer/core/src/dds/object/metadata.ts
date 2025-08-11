import type { ObjectDDS } from "./ObjectDDS.js";
import type { ISerializer } from "../../serialization/types.js";

export const metadataKey = Symbol.for("Symbol.metadata");
export const propertiesKey = Symbol("ObjectDDS.properties");

export interface ObjectDDSPropertyMetadata
{
  readonly name: string
  readonly index: number
  get(target: ObjectDDS): unknown
  set(target: ObjectDDS, value: unknown): void
  readonly serializer: ISerializer<any>
  readonly nullable: boolean
  readonly since?: number
}
