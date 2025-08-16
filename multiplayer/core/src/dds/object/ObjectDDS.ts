import { DDS } from "../DDS.js";
import { ObjectDDSMetadata } from "./ObjectDDSMetadata.js";
import type { DDSAttributes } from "@osucad/multiplayer-protocol";
import type { Delta } from "../Delta.js";
import type { IObjectDelta } from "./ObjectDelta.js";
import { ObjectDelta } from "./ObjectDelta.js";
import type { ObjectDDSPropertyMetadata } from "./metadata.js";
import type { IDecoder, IEncoder } from "../../serialization/types.js";
import { nn } from "../../utils/nn.js";

export const objectDDSMetadata = Symbol("ObjectDDS.metadata");

export class ObjectDDS extends DDS<IObjectDelta>
{
  readonly [objectDDSMetadata]: ObjectDDSMetadata;

  constructor(attributes: DDSAttributes)
  {
    super(attributes);

    this[objectDDSMetadata] = ObjectDDSMetadata.for(this);
  }

  protected override process([version, values]: IObjectDelta, local: boolean): void
  {
    if (!local)
    {
      for (const key in values)
      {
        if (this.#pendingProperties.has(key))
          continue;

        const property = nn(this[objectDDSMetadata].getPropertyByName(key));

        const value = property.serializer.deserialize(values[key], this.decoder);

        this.#setValue(property, value, false);
      }

      return;
    }

    for (const key in values)
    {
      const property = nn(this[objectDDSMetadata].getPropertyByName(key));

      const pendingVersion = this.#pendingProperties.get(property.name);

      if (pendingVersion !== undefined && version >= pendingVersion)
        this.#pendingProperties.delete(property.name);
    }
  }

  protected override replay(delta: Delta): void
  {
    if (!(delta instanceof ObjectDelta))
      return;

    for (const key in delta.values)
    {
      const property = nn(this[objectDDSMetadata].getPropertyByName(key));

      const value = property.serializer.deserialize(delta.values[key], this.decoder);

      this.setValue(property, value);
    }
  }

  #version = 0;
  readonly #pendingProperties = new Map<string, number>();

  setValue(property: ObjectDDSPropertyMetadata, newValue: unknown)
  {
    let oldValue = property.get(this);

    if (property.serializer.equals?.(oldValue, newValue) ?? oldValue === newValue)
      return;


    this.#setValue(property, newValue, true);

    if (!this.isAttached())
      return;

    newValue = property.serializer.serialize(newValue, this.encoder);
    oldValue = property.serializer.serialize(oldValue, this.encoder);

    const version = ++this.#version;

    this.#pendingProperties.set(property.name, version);

    const delta = ObjectDelta.from(version, property, newValue);
    const undo = ObjectDelta.from(version, property, oldValue);

    this.submitDelta(delta, undo);
  }

  #setValue(property: ObjectDDSPropertyMetadata, value: unknown, local: boolean): unknown
  {
    const oldValue = property.get(this);

    property.set(this, value);

    this.onPropertyChanged(property, value, oldValue, local);

    this.emit(`update:${property.name}`, value, oldValue);
    return oldValue;
  }

  override createSummary(encoder: IEncoder)
  {
    const properties = this[objectDDSMetadata].properties;

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

    const properties = this[objectDDSMetadata].properties;

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

  protected onPropertyChanged(property: ObjectDDSPropertyMetadata, newValue: unknown, oldValue: unknown, local: boolean)
  {
  }
}
