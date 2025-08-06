import type { ClientRuntime } from "./ClientRuntime";
import type { DDS } from "./dds";
import type { Delta } from "./dds/Delta";
import { Action } from "@osucad/framework";

export class HistoryManager
{
  #activeTransaction = new Transaction();

  readonly #undoStack: HistoryEntry[] = [];
  readonly #redoStack: HistoryEntry[] = [];

  readonly onUndo = new Action();
  readonly onRedo = new Action();

  constructor(
    readonly runtime: ClientRuntime,
  )
  {
    runtime.localOpSubmitted.addListener(this.#onOpSubmitted, this);
  }

  #onOpSubmitted(_dds: DDS, _delta: Delta, undo: Delta)
  {
    this.#activeTransaction.append(undo);
  }

  commit()
  {
    if (this.#activeTransaction.length === 0)
      return false;

    this.#undoStack.push(new HistoryEntry(this.#activeTransaction.deltas));
    this.#redoStack.length = 0;

    this.#activeTransaction = new Transaction();

    return true;
  }

  undo()
  {
    this.commit();

    const entry = this.#undoStack.pop();
    if (!entry)
      return false;

    this.onUndo.emit();

    this.#replayDeltas(entry.deltas);

    if (this.#activeTransaction.length > 0)
    {
      this.#redoStack.push(new HistoryEntry(this.#activeTransaction.deltas));
      this.#activeTransaction = new Transaction();
    }

    return true;
  }

  redo()
  {
    if (this.#activeTransaction.length > 0)
      return false;

    const entry = this.#redoStack.pop();
    if (!entry)
      return false;

    this.onRedo.emit();

    this.#replayDeltas(entry.deltas);

    if (this.#activeTransaction.length > 0)
    {
      this.#redoStack.push(new HistoryEntry(this.#activeTransaction.deltas));
      this.#activeTransaction = new Transaction();
    }

    return true;
  }

  #replayDeltas(deltas: Delta[])
  {
    for (const delta of deltas)
    {
      const target = this.runtime.getObject(delta.targetId);
      if (!target)
        continue;

      target.replayDelta(delta);
    }
  }
}

class Transaction
{
  readonly deltas: Delta[] = [];
  readonly #mergeMap = new Map<string, Delta[]>();

  get length()
  {
    return this.deltas.length;
  }

  append(delta: Delta)
  {
    if (!delta.mergeKey)
    {
      this.deltas.unshift(delta);
      return;
    }

    const candidates = this.#mergeMap.get(delta.mergeKey);

    if (candidates !== undefined)
    {
      for (const candidate of candidates)
      {
        if (delta.tryMerge(candidate))
          return;
      }

      candidates.unshift(delta);
    }
    else
    {
      this.#mergeMap.set(delta.mergeKey, [delta]);
    }

    this.deltas.unshift(delta);
  }
}

class HistoryEntry
{
  constructor(readonly deltas: Delta[])
  {
  }
}
