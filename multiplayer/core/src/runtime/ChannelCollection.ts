import type { DDS, DDSFactoryOrConstructor } from "../dds/index.js";
import type { IAttachMessage, IDDSSummary, IDeltaMessage } from "@osucad/multiplayer-protocol";
import { type IDocumentMessage, type IDocumentSummary, MessageType } from "@osucad/multiplayer-protocol";
import { summarizeDocument } from "./summarizeDocument.js";
import type { DocumentRuntime } from "./DocumentRuntime.js";
import { DDSChannel } from "../dds/DDSChannel.js";
import { nn } from "../utils/nn.js";
import { DDSFactoryRegistry } from "./DDSFactoryRegistry.js";
import { assert } from "../utils/assert.js";

export class ChannelCollection
{
  constructor(readonly runtime: DocumentRuntime, types: DDSFactoryOrConstructor<DDS>[])
  {
    this.typeRegistry = new DDSFactoryRegistry(types);
  }

  readonly typeRegistry: DDSFactoryRegistry;

  root!: DDS;

  readonly #channels = new Map<string, DDSChannel>();

  get objectCount()
  {
    return this.#channels.size - 1;
  }

  createSummary(): IDocumentSummary
  {
    return summarizeDocument(this.runtime);
  }

  load(summary: IDocumentSummary): void
  {
    this.typeRegistry.ensureSupported(summary.types);

    assert(
        summary.root in summary.entries,
        "Summary does not contain entry for root object",
    );

    this.#loadObjects(Object.entries(summary.entries).map(([id, summary]) => ({ id, summary })));

    this.root = nn(this.getObject(summary.root));
  }

  attach(dds: DDS): boolean
  {
    if (dds.isAttached())
      return false;

    const id = this.runtime.generateUniqueId();

    const channel = new DDSChannel(id, this.runtime, dds);

    dds.attach(channel);

    this.#channels.set(id, channel);

    this.runtime.submitAttachMessage(channel.target, {
      attributes: dds.attributes,
      content: dds.createSummary(channel.encoder),
    });

    return true;
  }

  detach(dds: DDS): boolean
  {
    if (!dds.isAttached())
      return false;

    const channel = this.#channels.get(dds.id);

    assert(
        !!channel,
        "Object is attached but channel not found",
    );

    dds.detach(channel!);
    this.#channels.delete(dds.id);

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

  process(message: IDocumentMessage, local: boolean)
  {
    switch (message.type)
    {
    case MessageType.Delta:
      this.processDeltaMessage(message, local);
      break;
    case MessageType.Attach:
      this.processAttachMessage(message, local);
      break;
    }
  }

  protected processDeltaMessage(message: IDeltaMessage, local: boolean)
  {
    for (const { target, content } of message.deltas)
    {
      this.#channels.get(target)?.process(content, local);
    }
  }

  protected processAttachMessage(message: IAttachMessage, local: boolean)
  {
    if (local)
      return;

    this.#loadObjects(message.content);
  }

  #loadObjects(entries: { id: string, summary: IDDSSummary }[])
  {
    const loadQueue: { channel: DDSChannel, summary: IDDSSummary }[] = [];

    for (const { id, summary } of entries)
    {
      const factory = nn(this.typeRegistry.get(summary.attributes));

      const dds = factory.create();

      const channel = new DDSChannel(id, this.runtime, dds);

      this.#channels.set(id, channel);
      channel.target.attach(channel);

      loadQueue.push({ channel, summary });
    }

    for (const { channel, summary } of loadQueue)
    {
      channel.load(summary);
    }
  }

  dispose()
  {
    for (const channel of [...this.#channels.values()])
      this.detach(channel.target);

    (this.runtime as unknown) = null;
  }
}
