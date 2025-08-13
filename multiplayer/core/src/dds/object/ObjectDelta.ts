import { Delta } from "../Delta.js";
import type { ObjectDDSPropertyMetadata } from "./metadata.js";

export type IObjectDelta = [number, Record<string, unknown>];

export class ObjectDelta extends Delta<IObjectDelta>
{
  static from(version: number, property: ObjectDDSPropertyMetadata, value: unknown)
  {
    return new ObjectDelta(version, { [property.name]: value });
  }

  constructor(readonly version: number, readonly values: Record<string, unknown>)
  {
    super();
  }

  public override encode(): IObjectDelta
  {
    const { version, values } = this;

    return [version, values];
  }
}

export interface ObjectDeltaEntry
{
  property: ObjectDDSPropertyMetadata;
  value: unknown;
}
