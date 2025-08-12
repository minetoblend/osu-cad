import { Delta } from "../Delta.js";
import type { ObjectDDSPropertyMetadata } from "./metadata.js";

export class ObjectDelta extends Delta
{
  static from(version: number, property: ObjectDDSPropertyMetadata, value: unknown)
  {
    return new ObjectDelta(version, [{ property, value }]);
  }

  constructor(readonly version: number, readonly entries: ObjectDeltaEntry[])
  {
    super("set");
  }

  public override encode(): unknown
  {
    const content: Record<string, unknown> = {};

    for (const entry of this.entries)
    {
      content[entry.property.name] = entry.value;
    }

    return { version: this.version, content };
  }
}

export interface ObjectDeltaEntry
{
  property: ObjectDDSPropertyMetadata;
  value: unknown;
}
