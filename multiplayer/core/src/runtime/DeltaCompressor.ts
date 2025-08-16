import type { IEncodedDelta } from "@osucad/multiplayer-protocol";
import { MergeableDelta, type Delta } from "../dds/index.js";
import { MultiValueMap } from "../utils/index.js";

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
  #mergeMap = new MultiValueMap<string, IDeltaEntry>();

  push(target: string, delta: Delta)
  {
    const entry: IDeltaEntry = { target, delta };

    if (!(delta instanceof MergeableDelta))
    {
      this.#deltas.push(entry);
      return;
    }

    const entries = this.#mergeMap.get(entry.target);

    for (let i = entries.length - 1; i >= 0; i--)
    {
      const other = entries[i];
      const otherDelta = other.delta as MergeableDelta;
      if (otherDelta.tryAppend(delta))
      {
        const index = this.#deltas.indexOf(other);
        this.#deltas.splice(index, 1);
        this.#deltas.push(other);
        return;
      }
    }

    this.#mergeMap.add(entry.target, entry);
    this.#deltas.push(entry);
  }

  hasDeltas()
  {
    return this.#deltas.length > 0;
  }

  process(): IEncodedDelta[]
  {
    const deltas = this.#deltas.map(encodeEntry);

    this.#deltas = [];
    this.#mergeMap.clear();

    return deltas;
  }
}
