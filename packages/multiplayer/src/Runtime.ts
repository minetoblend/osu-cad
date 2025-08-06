import type { DDS, DDSAttributes } from "./dds";
import { v4 as uuid } from "uuid";
import type { Delta } from "./dds/Delta";
import { Action } from "@osucad/framework";
import type { BinaryReader, BinaryWriter } from "./serialization";

type DDSFactory = (new () => DDS) & { Attributes: DDSAttributes } ;

export class Runtime
{
  readonly factories = new Map<string, DDSFactory>();

  constructor(
    types: DDSFactory[],
  )
  {
    for (const type of types)
      this.factories.set(type.Attributes.type, type);
  }

  readonly #objects = new Map<string, DDS>();

  attach(dds: DDS, id: string = uuid())
  {
    if (this.#objects.has(id))
      return;

    this.#objects.set(id, dds);
    dds.attach(id, this);
  }

  createSummary(writer: BinaryWriter)
  {
    writer.writeVarInt(this.factories.size);

    for (const { Attributes: { type, version } } of this.factories.values())
    {
      writer.writeString(type);
      writer.writeVarInt(version);
    }

    writer.writeVarInt(this.#objects.size);

    for (const [id, dds] of this.#objects.entries())
    {
      writer.writeUuid(id);
      writer.writeString(dds.attributes.type);
      writer.writeVarInt(dds.attributes.version);
      dds.createSummary(writer);
    }
  }

  load(reader: BinaryReader)
  {
    const factoryCount = reader.readVarInt();
    for (let i = 0;i < factoryCount; i++)
    {
      const type = reader.readString();
      const version = reader.readVarInt();

      const factory = this.factories.get(type);
      if (!factory)
        throw Error(`No factory found for "${type}"`);

      if (factory.Attributes.version < version)
        throw Error(`Factory "${type}" does not match required version (>= ${version})`);
    }

    const count = reader.readVarInt();
    for (let i = 0; i < count; i++)
    {
      const id = reader.readUuid();
      const type = reader.readString();
      const version = reader.readVarInt();

      const factory = this.factories.get(type);
      console.assert(factory !== undefined);

      const dds = new factory!();

      this.attach(dds, id);

      dds.load(reader, version);
    }
  }

  submitLocalOp(dds: DDS, delta: Delta, undo: Delta)
  {
    this.localOpSubmitted.emit(dds, delta, undo);
  }

  readonly localOpSubmitted = new Action<[DDS, Delta, Delta]>();

  public getObject(id: string)
  {
    return this.#objects.get(id);
  }

  processDeltas(reader: BinaryReader, local: boolean)
  {
    const count = reader.readVarInt();
    for (let i = 0; i < count; i++)
    {
      const target = this.getObject(reader.readUuid());
      const length = reader.readVarInt();

      if (!target)
      {
        reader.skip(length);
        continue;
      }

      target.process(reader, local);
    }
  }
}
