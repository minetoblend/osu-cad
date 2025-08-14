import type { DocumentRuntime } from "../runtime/index.js";
import type { DDS } from "./DDS.js";
import type { Delta } from "./Delta.js";
import type { IDecoder } from "../serialization/types.js";
import { Decoder, Encoder } from "../serialization/types.js";
import { sign } from "crypto";

export class DDSChannel
{
  constructor(
    readonly id: string,
    readonly runtime: DocumentRuntime,
    readonly target: DDS,
  )
  {
    this.encoder = new Encoder();
    this.encoder.on("ddsEncoded", dds => runtime.ensureCreated(dds));

    this.decoder = new Decoder(runtime);
  }

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

  load(summary: unknown, version: number, decoder: IDecoder)
  {
    this.#handler.load(summary, version, decoder);
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
