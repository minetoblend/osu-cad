import type { IDDSSummary, IRemoteSignalMessage } from "@osucad/multiplayer-protocol";
import type { DocumentRuntime } from "../runtime/index.js";
import type { IDecoder } from "../serialization/types.js";
import { Decoder, Encoder } from "../serialization/types.js";
import type { Attached, DDS } from "./DDS.js";
import type { Delta } from "./Delta.js";

export class DDSChannel
{
  public constructor(
    public readonly id: string,
    public readonly runtime: DocumentRuntime,
    target: DDS,
  )
  {
    this.target = target as Attached<DDS>;
    this.encoder = new Encoder();
    this.encoder.on("ddsEncoded", dds => runtime.objects.attach(dds));

    this.decoder = new Decoder(runtime);
  }

  public readonly target: Attached<DDS>;
  public readonly encoder: Encoder;
  public readonly decoder: Decoder;

  public submitDelta(delta: Delta, undo: Delta | null)
  {
    this.runtime.submitDelta(this.target, delta, undo);
  }

  public submitSignal(type: string, signal: unknown)
  {
    this.runtime.submitSignal(this.target, type, signal);
  }

  #handler!: IDeltaHandler;

  public setHandler(handler: IDeltaHandler)
  {
    this.#handler = handler;
  }

  public load(summary: IDDSSummary)
  {
    const { content, attributes } = summary;

    this.#handler.load(content, attributes.version, this.decoder);
  }

  public replay(delta: Delta)
  {
    this.#handler.replay(delta);
  }

  public process(delta: unknown, local: boolean)
  {
    this.#handler.process(delta, local);
  }

  public processSignal(message: IRemoteSignalMessage, local: boolean)
  {
    this.#handler.processSignal(message, local);
  }
}

export interface IDeltaHandler
{
  process: (delta: unknown, local: boolean) => void;
  processSignal: (message: IRemoteSignalMessage, local: boolean) => void;
  replay: (delta: Delta) => void;
  load: (summary: unknown, version: number, decoder: IDecoder) => void;
}
