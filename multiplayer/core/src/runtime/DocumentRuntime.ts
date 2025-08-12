import { EventEmitter } from "eventemitter3";
import type { DDS, DDSFactory, DDSFactoryOrConstructor } from "../dds/index.js";
import type { Delta, IEncodedDelta } from "../dds/Delta.js";
import type { IDocumentSummary } from "./summary.js";
import { Decoder, Encoder } from "../serialization/types.js";
import { DDSPool } from "./DDSPool.js";

export interface DocumentRuntimeEvents
{
  deltaSubmitted(dds: DDS, delta: Delta, undo: Delta | null): void;
}

export class DocumentRuntime extends EventEmitter<DocumentRuntimeEvents>
{
  constructor(types: DDSFactoryOrConstructor<DDS>[])
  {
    super();

    this.#objectPool = new DDSPool(this, types);
  }

  readonly #objectPool: DDSPool;

  get root()
  {
    return this.#objectPool.root;
  }

  get objects()
  {
    return this.#objectPool;
  }

  get typeRegistry()
  {
    return this.#objectPool.typeRegistry;
  }

  static create(root: DDS, types: DDSFactoryOrConstructor<DDS>[])
  {
    const runtime = new DocumentRuntime(types);

    runtime.#objectPool.root = root;
    runtime.#objectPool.attachDDS(root, "root");

    const encoder = new Encoder();
    encoder.on("ddsEncoded", other =>
    {
      runtime.#objectPool.attachDDS(other);
      other.createSummary(encoder);
    });

    root.createSummary(encoder);

    return runtime;
  }

  createSummary()
  {
    return this.#objectPool.createSummary();
  }

  load(summary: IDocumentSummary)
  {
    this.#objectPool.load(summary, 0, new Decoder(this.#objectPool));
  }

  getObject(id: string)
  {
    return this.#objectPool.getObject(id);
  }

  submitDelta(target: DDS, delta: Delta, undo: Delta | null): void
  {
    this.emit("deltaSubmitted", target, delta, undo);
  }

  replayDelta(targetId: string, delta: Delta)
  {
    this.#objectPool.getChannel(targetId)?.replay(delta);
  }

  process(targetId: string, delta: IEncodedDelta, local: boolean)
  {
    const channel = this.#objectPool.getChannel(targetId);
    if (!channel)
      return false;

    channel.process(channel.target.decodeDelta(delta), local);

    return true;
  }

  ensureCreated(dds: DDS)
  {
    this.#objectPool.create(dds);
  }


}
