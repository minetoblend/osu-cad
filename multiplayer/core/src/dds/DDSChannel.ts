import type { DocumentRuntime } from "../runtime/index.js";
import type { Attached, DDS } from "./DDS.js";
import type { Delta } from "./Delta.js";
import type { IDecoder } from "../serialization/types.js";
import { Decoder, Encoder } from "../serialization/types.js";
import { sign } from "crypto";
import type { IDDSSummary } from "@osucad/multiplayer-protocol";

export class DDSChannel
{
  constructor(
    readonly id: string,
    readonly runtime: DocumentRuntime,
    target: DDS,
  )
  {
    this.target = target as Attached<DDS>;
    this.encoder = new Encoder();
    this.encoder.on("ddsEncoded", dds => runtime.objects.attach(dds));

    this.decoder = new Decoder(runtime.objects);
  }

  readonly target: Attached<DDS>;
  readonly encoder: Encoder;
  readonly decoder: Decoder;

  submitDelta(delta: Delta, undo: Delta | null)
  {
    this.runtime.submitDelta(this.target, delta, undo);
  }

  submitSignal(type: string, signal: unknown)
  {
    this.runtime.submitSignal(this.target, type, signal);
  }

  #handler!: IDeltaHandler;

  setHandler(handler: IDeltaHandler)
  {
    this.#handler = handler;
  }

  load(summary: IDDSSummary)
  {
    const { content, attributes } = summary;

    this.#handler.load(content, attributes.version, this.decoder);
  }

  replay(delta: Delta)
  {
    this.#handler.replay(delta);
  }

  process(delta: unknown, local: boolean)
  {
    this.#handler.process(delta, local);
  }

  processSignal(clientId: number, type: string, signal: unknown)
  {
    this.#handler.processSignal(clientId, type, signal);
  }
}

export interface IDeltaHandler
{
  process: (delta: unknown, local: boolean) => void;
  processSignal: (clientId: number, type: string, signal: unknown) => void;
  replay: (delta: Delta) => void;
  load: (summary: unknown, version: number, decoder: IDecoder) => void;
}
