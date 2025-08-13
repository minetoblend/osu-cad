import type { DocumentRuntime } from "../runtime/index.js";
import type { DDS } from "./DDS.js";
import type { Delta } from "./Delta.js";
import type { IDecoder } from "../serialization/types.js";
import { Decoder, Encoder } from "../serialization/types.js";

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
}

export interface IDeltaHandler
{
  process: (delta: unknown, local: boolean) => void;
  replay: (delta: Delta) => void;
  load: (summary: unknown, version: number, decoder: IDecoder) => void;
}
