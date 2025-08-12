import type { DDSAttributes } from "./DDSAttributes.js";
import type { DDSChannel } from "./DDSChannel.js";
import type { Delta, IEncodedDelta } from "./Delta.js";
import type { IDecoder, IEncoder } from "../serialization/types.js";
import { Encoder } from "../serialization/types.js";
import { EventEmitter } from "eventemitter3";

const defaultEncoder = new Encoder();

export abstract class DDS extends EventEmitter
{
  protected constructor(readonly attributes: DDSAttributes)
  {
    super();
  }

  #channel: DDSChannel | null = null;

  get id(): string | null
  {
    return this.#channel?.id ?? null;
  }

  get isAttached()
  {
    return this.#channel !== null;
  }

  protected get runtime()
  {
    return this.#channel?.runtime;
  }

  protected get encoder()
  {
    return this.#channel?.encoder ?? defaultEncoder;
  }

  protected get decoder()
  {
    return this.#channel!.decoder!;
  }

  attach(channel: DDSChannel)
  {
    this.#channel = channel;

    channel.setHandler({
      process: (delta, local) => this.process(delta, local),
      replay: delta => this.replay(delta),
      load: (summary, version, decoder) => this.load(summary, version, decoder),
    });
  }

  detach(channel: DDSChannel)
  {
    if (channel === this.#channel)
      this.#channel = null;
  }

  protected abstract process(delta: Delta, local: boolean): void;

  protected abstract replay(delta: Delta): void;

  abstract createSummary(encoder: IEncoder): unknown;

  abstract load(summary: unknown, version: number, decoder: IDecoder): void;

  abstract decodeDelta(content: IEncodedDelta): Delta;

  protected submitDelta(delta: Delta, undo: Delta | null = null)
  {
    this.#channel?.submitDelta(delta, undo);
  }
}
