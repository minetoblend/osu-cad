import { EventEmitter } from "eventemitter3";
import type { DDS, DDSFactory } from "../dds/index.js";
import type { Delta } from "../dds/Delta.js";
import type { IDocumentSummary } from "./summary.js";
import { DDSFactoryRegistry } from "./DDSFactoryRegistry.js";
import { Decoder, Encoder } from "../serialization/types.js";
import { DDSPool } from "./DDSPool.js";

export interface DocumentRuntimeEvents
{
  deltaSubmitted(dds: DDS, delta: Delta, undo: Delta | null): void;
}

export class DocumentRuntime extends EventEmitter<DocumentRuntimeEvents>
{
  constructor(types: DDSFactory<DDS>[])
  {
    super();

    this.#objectPool = new DDSPool(this, types);
  }

  readonly #objectPool: DDSPool;

  get root()
  {
    return this.#objectPool.root;
  }

  get typeRegistry()
  {
    return this.#objectPool.typeRegistry;
  }

  static create(root: DDS, types: DDSFactory<DDS>[])
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

  process(targetId: string, delta: Delta, local: boolean)
  {
    this.#objectPool.getChannel(targetId)?.process(delta, local);
  }

  ensureCreated(dds: DDS)
  {
    this.#objectPool.create(dds);
  }
}
