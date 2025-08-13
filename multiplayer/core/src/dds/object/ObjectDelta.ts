import { MergeableDelta } from "../Delta.js";
import type { ObjectDDSPropertyMetadata } from "./metadata.js";

export type IObjectDelta = [number, Record<string, unknown>];

export class ObjectDelta extends MergeableDelta<IObjectDelta>
{
  static from(version: number, property: ObjectDDSPropertyMetadata, value: unknown)
  {
    return new ObjectDelta(version, { [property.name]: value });
  }

  constructor(public version: number, public values: Record<string, unknown>)
  {
    super();
  }

  public override encode(): IObjectDelta
  {
    const { version, values } = this;

    return [version, values];
  }

  public override tryAppend(other: MergeableDelta): boolean
  {
    if (!(other instanceof ObjectDelta))
      return false;

    this.values = { ...this.values, ...other.values };
    this.version = Math.max(this.version, other.version);

    return true;
  }
}

export interface ObjectDeltaEntry
{
  property: ObjectDDSPropertyMetadata;
  value: unknown;
}
