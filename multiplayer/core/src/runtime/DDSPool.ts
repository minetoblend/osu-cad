import type { IEncodedDelta } from "src/dds/Delta.js";
import { Delta } from "src/dds/Delta.js";
import type { IDecoder } from "src/serialization/types.js";
import { Encoder } from "src/serialization/types.js";
import { DDS, type DDSFactory } from "../dds/index.js";
import type { IDDSSummary, IDocumentSummary } from "./summary.js";
import { summarizeDocument } from "./summarizeDocument.js";
import type { DocumentRuntime } from "./DocumentRuntime.js";
import { DDSChannel } from "../dds/DDSChannel.js";
import { nn } from "../utils/nn.js";
import { DDSFactoryRegistry } from "./DDSFactoryRegistry.js";

export class DDSPool extends DDS
{
  constructor(readonly runtime: DocumentRuntime, types: DDSFactory<DDS>[])
  {
    super({ type: "builtin:object-pool", version: 0 });

    this.typeRegistry = new DDSFactoryRegistry(types);

    this.attachDDS(this, "/");
  }

  readonly typeRegistry: DDSFactoryRegistry;

  root!: DDS;

  readonly #channels = new Map<string, DDSChannel>();

  get objectCount()
  {
    return this.#channels.size - 1;
  }

  protected override process(delta: Delta, local: boolean): void
  {
    if (delta instanceof CreateObjectDelta)
    {
      let object = this.getObject(delta.id);
      if (object)
        return;

      const factory = nn(this.typeRegistry.get(delta.summary.attributes));

      object = factory.create();

      this.attachDDS(object, delta.id);

      nn(this.getChannel(delta.id)).load(delta.summary.content, delta.summary.attributes.version, this.decoder);
    }
  }

  protected override replay(delta: Delta): void
  {
    if (delta instanceof CreateObjectDelta)
    {
      let object = this.getObject(delta.id);
      if (object)
        return;

      const factory = nn(this.typeRegistry.get(delta.summary.attributes));

      object = factory.create();

      this.attachDDS(object, delta.id);
    }
  }

  override createSummary(): IDocumentSummary
  {
    return summarizeDocument(this.runtime);
  }

  override load(content: unknown, version: number, decoder: IDecoder): void
  {
    const summary = content as IDocumentSummary;

    this.typeRegistry.ensureSupported(summary.types);

    for (const id in summary.entries)
    {
      const entry = summary.entries[id];

      const factory = this.typeRegistry.get(entry.attributes);
      if (!factory)
        throw new Error(`Unknown dds type "${JSON.stringify(entry.attributes)}"`);

      const dds = factory.create();

      this.attachDDS(dds, id);
    }

    for (const id in summary.entries)
    {
      const entry = summary.entries[id];
      const channel = nn(this.#channels.get(id));

      channel.load(entry.content, entry.attributes.version, decoder);
    }

    this.root = nn(this.getObject(summary.root), `Could not find entrypoint with id "${summary.root}"`);
  }

  attachDDS(dds: DDS, id: string = crypto.randomUUID()): boolean
  {
    if (dds.isAttached)
      return false;

    const channel = new DDSChannel(id, this.runtime, dds);

    dds.attach(channel);

    this.#channels.set(id, channel);

    return true;
  }

  create(dds: DDS)
  {
    if (!this.attachDDS(dds))
      return;

    this.submitDelta(new CreateObjectDelta(nn(dds.id), {
      attributes: dds.attributes,
      content: dds.createSummary(this.encoder),
    }));
  }

  detachDDS(dds: DDS): boolean
  {
    if (!dds.isAttached)
      return false;

    const id = nn(dds.id);

    const channel = this.#channels.get(id);

    if (!channel)
      return false;

    dds.detach(channel);
    this.#channels.delete(id);

    return true;
  }

  getObject(id: string)
  {
    return this.#channels.get(id)?.target;
  }

  getChannel(id: string)
  {
    return this.#channels.get(id);
  }

  public override decodeDelta(delta: IEncodedDelta): Delta
  {
    if (delta.type !== "create")
      throw new Error(`Unknown delta type "${delta.type}"`);

    const content = delta.content as { id: string, summary: IDDSSummary };

    return new CreateObjectDelta(content.id, content.summary);
  }

  collectGarbage()
  {
    const trackedIds = new Set<string>([nn(this.id), nn(this.root.id)]);

    const encoder = new Encoder();

    encoder.on("ddsEncoded", dds =>
    {
      const id = nn(dds.id);

      if (!trackedIds.has(id))
      {
        trackedIds.add(id);
        dds.createSummary(encoder);
      }
    });

    this.root.createSummary(encoder);

    const toDelete = new Set(this.#channels.keys());
    for (const id of trackedIds)
      toDelete.delete(id);

    for (const id of toDelete)
    {
      const channel = nn(this.#channels.get(id)!);

      this.detachDDS(channel.target);
    }
  }
}


class CreateObjectDelta extends Delta
{
  constructor(readonly id: string, readonly summary: IDDSSummary)
  {
    super("create");
  }

  public override encode(): unknown
  {
    const { id, summary } = this;

    return { id, summary };
  }
}
