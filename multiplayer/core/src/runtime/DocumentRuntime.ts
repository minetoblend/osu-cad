import { EventEmitter } from "eventemitter3";
import type { DDS, DDSFactoryOrConstructor } from "../dds/index.js";
import type { Delta } from "../dds/Delta.js";
import type { IDDSSummary } from "@osucad/multiplayer-protocol";
import { Decoder, Encoder } from "../serialization/types.js";
import { DDSPool } from "./DDSPool.js";
import { DDSFactoryRegistry } from "./DDSFactoryRegistry.js";
import type { IdGenerator } from "./IdGenerator.js";
import { UUIDGenerator } from "./IdGenerator.js";

export interface DocumentRuntimeEvents
{
  deltaSubmitted(dds: DDS, delta: Delta, undo: Delta | null): void;
  signalSubmitted(dds: DDS, type: string, signal: unknown): void;
}

export interface DocumentRuntimeOptions
{
  readonly typeRegistry: DDSFactoryRegistry
  readonly idGenerator: IdGenerator
}

export class DocumentRuntime<T extends DDS = DDS> extends EventEmitter<DocumentRuntimeEvents>
{
  constructor({
    typeRegistry,
    idGenerator,
  }: DocumentRuntimeOptions)
  {
    super();

    this.typeRegistry = typeRegistry;
    this.idGenerator = idGenerator;

    this.#objectPool = new DDSPool(this);
  }

  readonly typeRegistry: DDSFactoryRegistry;

  readonly idGenerator: IdGenerator;

  readonly #objectPool: DDSPool;

  get root(): T
  {
    return this.#objectPool.root as T;
  }

  get objects()
  {
    return this.#objectPool;
  }

  static create<T extends DDS>(root: T, types: DDSFactoryOrConstructor[])
  {
    const runtime = new DocumentRuntime<T>({
      typeRegistry: new DDSFactoryRegistry(types),
      idGenerator: new UUIDGenerator(),
    });

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

  async load(summary: Record<string, IDDSSummary>)
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

  submitSignal(target: DDS, type: string, signal: unknown): void
  {
    this.emit("signalSubmitted", target, type, signal);
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

  processSignal(clientId: number, targetId: string, type: string, signal: unknown)
  {
    const channel = this.#objectPool.getChannel(targetId);
    if (!channel)
      return false;

    channel.processSignal(clientId, type, signal);

    return true;
  }

  ensureCreated(dds: DDS)
  {
    this.#objectPool.create(dds);
  }

  dispose()
  {
    this.#objectPool.dispose();
    (this.#objectPool as unknown) = null;
  }

  public attach(dds: DDS): boolean
  {
    return this.#objectPool.attachDDS(dds);
  }
}
