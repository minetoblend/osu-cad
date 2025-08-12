import { Delta } from "../Delta.js";
import type { ObjectDDSPropertyMetadata } from "./metadata.js";

export class ObjectDelta extends Delta
{
  static from(property: ObjectDDSPropertyMetadata, value: unknown)
  {
    return new ObjectDelta([{ property, value }]);
  }

  constructor(readonly entries: ObjectDeltaEntry[])
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

    return content;
  }
}

export interface ObjectDeltaEntry
{
  property: ObjectDDSPropertyMetadata;
  value: unknown;
}
