import type { IEncoder, IDecoder } from "src/serialization/types.js";
import { DDS } from "./DDS.js";
import type { Delta } from "./Delta.js";
import type{ EventEmitter } from "eventemitter3";

export abstract class NoopDDS<EventTypes extends EventEmitter.ValidEventTypes = string | symbol> extends DDS<unknown, EventTypes>
{
  protected override process(delta: unknown, local: boolean): void
  {
  }
  protected override replay(delta: Delta): void
  {
  }
  override createSummary(encoder: IEncoder): unknown
  {
    return null;
  }
  override load(summary: unknown, version: number, decoder: IDecoder): void
  {
  }
}
