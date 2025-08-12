import { DDS } from "../DDS.js";
import { ObjectDDSMetadata } from "./ObjectDDSMetadata.js";
import type { DDSAttributes } from "../DDSAttributes.js";
import type  { Delta, IEncodedDelta } from "../Delta.js";
import type { ObjectDeltaEntry } from "./ObjectDelta.js";
import { ObjectDelta } from "./ObjectDelta.js";
import type { ObjectDDSPropertyMetadata } from "./metadata.js";
import type { IDecoder, IEncoder } from "../../serialization/types.js";
import { nn } from "../../utils/nn.js";

export class ObjectDDS extends DDS
{
  readonly metadata: ObjectDDSMetadata;

  constructor(attributes: DDSAttributes)
  {
    super(attributes);

    this.metadata = ObjectDDSMetadata.for(this);
  }

  protected override process(delta: Delta, local: boolean): void
  {
    if (!(delta instanceof ObjectDelta))
      return;

    if (!local)
    {
      for (const entry of delta.entries)
      {
        const value = entry.property.serializer.deserialize(entry.value, this.decoder);

        this.#setValue(entry.property, value);
      }

      return;
    }
  }

  protected override replay(delta: Delta): void
  {
    if (!(delta instanceof ObjectDelta))
      return;

    for (const entry of delta.entries)
    {
      const value = entry.property.serializer.deserialize(entry.value, this.decoder);

      this.setValue(entry.property, value);
    }
  }

  setValue(property: ObjectDDSPropertyMetadata, newValue: unknown)
  {
    let oldValue = property.get(this);

    if (oldValue === newValue)
      return;

    this.#setValue(property, newValue);

    if (!this.isAttached)
      return;

    newValue = property.serializer.serialize(newValue, this.encoder);
    oldValue = property.serializer.serialize(oldValue, this.encoder);

    const delta = ObjectDelta.from(property, newValue);
    const undo = ObjectDelta.from(property, oldValue);

    this.submitDelta(delta, undo);
  }

  #setValue(property: ObjectDDSPropertyMetadata, value: unknown)
  {
    // TODO: emit event
    property.set(this, value);
  }

  override createSummary(encoder: IEncoder)
  {
    const properties = this.metadata.properties;

    const entries: Record<string, unknown> = {};

    for (const { name, get, serializer } of properties)
    {
      entries[name] = serializer.serialize(get(this), encoder);
    }

    return entries;
  }

  override load(summary: unknown, version: number, decoder: IDecoder): void
  {
    if (version > this.attributes.version)
      throw new Error(`Cannot load summary with version ${version} (version=${this.attributes.version})`);

    const entries = summary as Record<string, unknown>;

    const properties = this.metadata.properties;

    for (const { name, set, serializer, since, nullable } of properties)
    {
      if (since !== undefined && since > version)
        continue;

      const value = entries[name];

      if ((value === undefined || value === null) && !nullable)
        throw new Error("Unexpected null value");

      set(this, serializer.deserialize(value, decoder));
    }
  }

  public override decodeDelta(delta: IEncodedDelta): Delta
  {
    if (delta.type !== "set")
      throw new Error(`Unknown delta type "${delta.type}"`);

    const content = delta.content as Record<string, unknown>;
    const entries: ObjectDeltaEntry[] = [];

    for(const key in content)
    {
      const property = nn(this.metadata.getPropertyByName(key), `Unknown property "${key}" in delta`);

      entries.push({ property, value: content[key] });
    }

    return new ObjectDelta(entries);
  }
}
