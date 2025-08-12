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
    super();
  }
}

export interface ObjectDeltaEntry
{
  property: ObjectDDSPropertyMetadata;
  value: unknown;
}
