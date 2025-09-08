import type { IEncodedDelta, IEncodedDeltas } from "@osucad/multiplayer-protocol";
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

  public push(target: string, delta: Delta)
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

  public hasDeltas()
  {
    return this.#deltas.length > 0;
  }

  public process(): IEncodedDeltas
  {
    const deltas = this.#deltas.map(encodeEntry);

    this.#deltas = [];
    this.#mergeMap.clear();

    const nameCount = new Map<string, number>();

    let encoded = JSON.stringify(deltas, (key, value) =>
    {
      if (key.length > 4)
      {
        nameCount.set(
            key,
            (nameCount.get(key) ?? 0) + 1,
        );
      }
      return value;
    });

    let index = 0;
    const symbols: string[] = [];

    for (const [name, count] of nameCount)
    {
      if (count < 5)
        continue;

      const placeholder = DeltaCompressor.encodeIndex(index++);

      encoded = encoded.replaceAll(`"${name}"`, placeholder);

      symbols.push(name);
    }

    return {
      content: encoded,
      symbols: symbols.length > 0 ? symbols : undefined,
    };
  }

  public static encodeIndex(index: number)
  {
    return `\\${(index).toString(36)}`;
  }
}
