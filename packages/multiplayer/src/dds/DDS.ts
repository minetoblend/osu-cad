import type { BinaryWriter,BinaryReader } from "../serialization";
import type { Runtime } from "../Runtime";
import { v4 as uuid } from "uuid";
import type { Delta } from "./Delta";

export interface DDSAttributes
{
  readonly type: string
  readonly version: number
}

export abstract class DDS
{
  #id: string = uuid();

  get id()
  {
    return this.#id;
  }

  protected constructor(
    readonly attributes: DDSAttributes,
  )
  {
  }

  abstract createSummary(writer: BinaryWriter): void;

  abstract load(reader: BinaryReader, version: number): void;

  abstract process(reader: BinaryReader, local: boolean): void;

  abstract replayDelta(delta: Delta): void;

  #runtime: Runtime | null = null;

  protected get isAttached()
  {
    return this.#runtime !== null;
  }

  attach(id: string, runtime: Runtime)
  {
    this.#id = id;
    this.#runtime = runtime;
  }

  detach()
  {
    this.#runtime = null;
  }

  submitLocalOp(delta: Delta, undo: Delta)
  {
    this.#runtime?.submitLocalOp(this, delta, undo);
  }
}
