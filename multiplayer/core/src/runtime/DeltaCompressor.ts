import type { IEncodedDelta } from "@osucad/multiplayer-protocol";
import type { Delta } from "../dds/index.js";

export interface IDeltaEntry
{
  target: string
  delta: Delta
}

function encodeEntry({ target, delta }: IDeltaEntry): IEncodedDelta
{
  return { target, content: delta.encode() };
}

export class DeltaCompressor
{
  #deltas: IDeltaEntry[] = [];

  push(target: string, delta: Delta)
  {
    this.#deltas.push({ target, delta });
  }

  hasDeltas()
  {
    return this.#deltas.length > 0;
  }

  process(): IEncodedDelta[]
  {
    const deltas = this.#deltas.map(encodeEntry);

    this.#deltas = [];

    return deltas;
  }
}
