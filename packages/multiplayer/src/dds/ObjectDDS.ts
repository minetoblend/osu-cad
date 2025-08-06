import type { DDSAttributes } from "./DDS";
import { DDS } from "./DDS";
import type { BinaryReader, Serializer } from "../serialization";
import type { BinaryWriter } from "../serialization";
import { getObjectDDSProperties } from "./decorator";
import { Delta } from "./Delta";

export const propertiesKey = Symbol("ObjectDDS.properties");

export interface PropertyMetadata
{
  get: (this: ObjectDDS) => unknown;
  set: (this: ObjectDDS, value: unknown) => void;
  serializer: Serializer<unknown>;
  index: number;
}

export class ObjectDDS extends DDS
{
  constructor(attributes: DDSAttributes)
  {
    super(attributes);

    this[propertiesKey] = getObjectDDSProperties(this);
  }

  readonly [propertiesKey]: PropertyMetadata[];

  override createSummary(writer: BinaryWriter)
  {
    for (const property of this[propertiesKey])
    {
      const value = property.get.call(this);

      property.serializer.encode(value, writer);
    }
  }

  public override load(reader: BinaryReader): void
  {
    for (const property of this[propertiesKey])
    {
      const value = property.serializer.decode(reader);

      property.set.call(this, value);
    }
  }

  public override process(reader: BinaryReader, local: boolean): void
  {
    const properties = this[propertiesKey];

    const delta = ObjectDelta.decode(reader, this);

    for (const { index, value } of delta.entries)
    {
      if (!local)
      {
        if (!this.#pendingMap.has(index))
          properties[index].set.call(this, value);

        return;
      }

      const version = this.#pendingMap.get(index);
      console.assert(version !== undefined);

      if (delta.version >= version!)
        this.#pendingMap.delete(index);
    }
  }

  public override replayDelta(delta: Delta): void
  {
    if (!(delta instanceof ObjectDelta))
      return;

    const properties = this[propertiesKey];

    for (const { index, value } of delta.entries)
    {
      const property = properties[index];
      console.assert(!!property);

      if (this.onPropertyChanged(index, property.get.call(this), value))
        property.set.call(this, value);
    }
  }

  #version = 0;
  #pendingMap = new Map<number, number>();

  onPropertyChanged(index: number, oldValue: unknown, newValue: unknown): boolean
  {
    if (!this.isAttached)
      return true;

    const property = this[propertiesKey][index];
    console.assert(!!property);

    const equals = property.serializer.equals?.(oldValue, newValue) ?? (oldValue === newValue);

    if (equals)
      return false;

    const version = ++this.#version;

    this.#pendingMap.set(index, version);

    const delta = new ObjectDelta(this, version, [{
      index,
      value: newValue,
    }]);

    const undo = new ObjectDelta(this, version, [{
      index,
      value: oldValue,
    }]);

    this.submitLocalOp(delta, undo);

    return true;
  }
}

export class ObjectDelta extends Delta
{
  constructor(readonly target: ObjectDDS, public version: number, readonly entries: { index: number, value: unknown }[] = [])
  {
    super(target.id);
  }

  static decode(reader: BinaryReader, target: ObjectDDS)
  {
    const delta = new ObjectDelta(target, reader.readVarInt());

    const properties = target[propertiesKey];

    const count = reader.readVarInt();

    for (let i = 0; i < count; i++)
    {
      const index = reader.readVarInt();
      const property = properties[index];
      console.assert(!!property);

      const value = property.serializer.decode(reader);

      delta.entries.push({
        index,
        value,
      });
    }

    return delta;
  }

  encode(writer: BinaryWriter)
  {
    const entries = this.entries;
    const properties = this.target[propertiesKey];

    writer.writeVarInt(this.version);
    writer.writeVarInt(entries.length);
    for (const entry of entries)
    {
      const property = properties[entry.index];
      console.assert(!!property);

      writer.writeVarInt(entry.index);

      property.serializer.encode(entry.value, writer);
    }
  }

  public override get mergeKey(): string | undefined
  {
    return this.targetId;
  }

  override tryMerge(delta: Delta): boolean
  {
    if (!(delta instanceof ObjectDelta))
      return false;

    for (const entry of delta.entries)
    {
      const index = this.entries.findIndex(it => it.index === entry.index);

      if (index === -1)
        this.entries.push(entry);
      else
        this.entries[index] = entry;
    }

    this.version = Math.max(this.version, delta.version);

    return true;
  }
}
