
import type { DDSChannel } from "./DDSChannel.js";
import type { Delta } from "./Delta.js";
import type { IDecoder, IEncoder } from "../serialization/types.js";
import { Encoder } from "../serialization/types.js";
import { EventEmitter } from "eventemitter3";
import type { DDSAttributes, IRemoteSignalMessage } from "@osucad/multiplayer-protocol";

const defaultEncoder = new Encoder();

export abstract class DDS<TDelta = unknown, EventTypes extends EventEmitter.ValidEventTypes = any> extends EventEmitter<EventTypes>
{
  protected constructor(public readonly attributes: DDSAttributes)
  {
    super();
  }

  #channel: DDSChannel | null = null;

  public get id(): string | null
  {
    return this.#channel?.id ?? null;
  }

  public isAttached(): this is Attached<this>
  {
    return this.#channel !== null;
  }

  public get runtime()
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

  public attach(channel: DDSChannel)
  {
    this.#channel = channel;

    channel.setHandler({
      process: (delta, local) => this.process(delta as TDelta, local),
      processSignal: (message, local) => this.processSignal(message, local),
      replay: delta => this.replay(delta),
      load: (summary, version, decoder) => this.load(summary, version, decoder),
    });
  }

  public detach(channel: DDSChannel)
  {
    if (channel === this.#channel)
      this.#channel = null;
  }

  protected abstract process(delta: TDelta, local: boolean): void;

  protected abstract replay(delta: Delta): void;

  public abstract createSummary(encoder: IEncoder): unknown;

  public abstract load(summary: unknown, version: number, decoder: IDecoder): void;

  protected processSignal(message: IRemoteSignalMessage, local: boolean)
  {
  }

  protected submitDelta(delta: Delta<TDelta>, undo: Delta<TDelta> | null = null)
  {
    this.#channel?.submitDelta(delta, undo);
  }

  protected submitSignal(type: string, signal: unknown)
  {
    this.#channel?.submitSignal(type, signal);
  }
}

export type Attached<T extends DDS> = T & {
  readonly id: string
};
