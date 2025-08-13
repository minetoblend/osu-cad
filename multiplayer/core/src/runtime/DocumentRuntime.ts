import { EventEmitter } from "eventemitter3";
import type { DDS, DDSFactoryOrConstructor } from "../dds/index.js";
import type { Delta, IEncodedDelta } from "../dds/Delta.js";
import type { IDocumentSummary } from "./summary.js";
import { Decoder, Encoder } from "../serialization/types.js";
import { DDSPool } from "./DDSPool.js";

export interface DocumentRuntimeEvents
{
  deltaSubmitted(dds: DDS, delta: Delta, undo: Delta | null): void;
}

export class DocumentRuntime<T extends DDS = DDS> extends EventEmitter<DocumentRuntimeEvents>
{
  protected constructor(types: DDSFactoryOrConstructor<DDS>[])
  {
    super();

    this.#objectPool = new DDSPool(this, types);
  }

  readonly #objectPool: DDSPool;

  get root(): T
  {
    return this.#objectPool.root as T;
  }

  get objects()
  {
    return this.#objectPool;
  }

  get typeRegistry()
  {
    return this.#objectPool.typeRegistry;
  }

  static create<T extends DDS>(root: T, types: DDSFactoryOrConstructor<DDS>[])
  {
    const runtime = new DocumentRuntime<T>(types);

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

  static async load(summary: IDocumentSummary, types: DDSFactoryOrConstructor<DDS>[])
  {
    const runtime = new DocumentRuntime(types);

    await runtime.load(summary);

    return runtime;
  }

  createSummary()
  {
    return this.#objectPool.createSummary();
  }

  async load(summary: IDocumentSummary)
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

  process(targetId: string, delta: unknown, local: boolean)
  {
    const channel = this.#objectPool.getChannel(targetId);
    if (!channel)
      return false;

    channel.process(delta, local);

    return true;
  }

  ensureCreated(dds: DDS)
  {
    this.#objectPool.create(dds);
  }

  clone()
  {
    return DocumentRuntime.load(this.createSummary(), this.typeRegistry.types());
  }

  dispose()
  {
    this.#objectPool.dispose();
    (this.#objectPool as unknown) = null;
  }
}
