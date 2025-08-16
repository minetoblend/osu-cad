import { EventEmitter } from "eventemitter3";
import type { Attached, DDS, DDSFactoryOrConstructor } from "../dds/index.js";
import type { Delta } from "../dds/Delta.js";
import type { IAttachMessage, IDDSSummary, IDocumentMessage, IRemoteDocumentMessage } from "@osucad/multiplayer-protocol";
import { type IDocumentSummary, MessageType } from "@osucad/multiplayer-protocol";
import { ChannelCollection } from "./ChannelCollection.js";

export interface DocumentRuntimeEvents
{
  deltaSubmitted(dds: Attached<DDS>, delta: Delta, undo: Delta | null): void;

  attached(dds: Attached<DDS>, summary: IDDSSummary): void

  signalSubmitted(dds: DDS, type: string, signal: unknown): void;
}

export class DocumentRuntime<T extends DDS = DDS> extends EventEmitter<DocumentRuntimeEvents>
{
  protected constructor(types: DDSFactoryOrConstructor<DDS>[])
  {
    super();

    this.#channelCollection = new ChannelCollection(this, types);
  }

  readonly #channelCollection: ChannelCollection;

  get root(): T
  {
    return this.#channelCollection.root as T;
  }

  get objects()
  {
    return this.#channelCollection;
  }

  get typeRegistry()
  {
    return this.#channelCollection.typeRegistry;
  }

  public generateUniqueId()
  {
    return crypto.randomUUID();
  }

  static create<T extends DDS>(root: T, types: DDSFactoryOrConstructor<DDS>[])
  {
    const runtime = new DocumentRuntime<T>(types);

    runtime.#channelCollection.root = root;
    runtime.#channelCollection.attach(root);

    return runtime;
  }

  static async load(summary: IDocumentSummary, types: DDSFactoryOrConstructor<DDS>[])
  {
    const runtime = new DocumentRuntime(types);

    await runtime.load(summary);

    return runtime;
  }

  createSummary()
  {
    return this.#channelCollection.createSummary();
  }

  async load(summary: IDocumentSummary)
  {
    this.#channelCollection.load(summary);
  }

  submitDelta(target: Attached<DDS>, delta: Delta, undo: Delta | null): void
  {
    this.emit("deltaSubmitted", target, delta, undo);
  }

  submitAttachMessage(target: Attached<DDS>, summary: IDDSSummary)
  {
    this.emit("attached", target, summary);
  }

  submitSignal(target: DDS, type: string, signal: unknown): void
  {
    this.emit("signalSubmitted", target, type, signal);
  }

  replayDelta(targetId: string, delta: Delta)
  {
    this.#channelCollection.getChannel(targetId)?.replay(delta);
  }

  process(message: IDocumentMessage, local: boolean)
  {
    switch (message.type)
    {
    case MessageType.Delta:
    case MessageType.Attach:
      this.#channelCollection.process(message, local);
      break;
    }
  }

  processSignal(clientId: string, targetId: string, type: string, signal: unknown)
  {
    const channel = this.#channelCollection.getChannel(targetId);
    if (!channel)
      return false;

    channel.processSignal(clientId, type, signal);

    return true;
  }

  clone()
  {
    return DocumentRuntime.load(this.createSummary(), this.typeRegistry.types());
  }

  dispose()
  {
    this.#channelCollection.dispose();
    (this.#channelCollection as unknown) = null;
  }
}
