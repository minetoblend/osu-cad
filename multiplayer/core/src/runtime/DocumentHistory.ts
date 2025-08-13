import type { DocumentRuntime } from "./DocumentRuntime.js";
import type { DDS } from "../dds/index.js";
import type { Delta } from "../dds/Delta.js";
import { nn } from "../utils/nn.js";
import { EventEmitter } from "eventemitter3";

export interface DocumentHistoryEvents
{
  commit(): void
  undo(): void
  redo(): void
}

export class DocumentHistory extends EventEmitter<DocumentHistoryEvents>
{
  #activeTransaction = new Transaction();

  #undoStack: Transaction[] = [];
  #redoStack: Transaction[] = [];

  constructor(readonly runtime: DocumentRuntime)
  {
    super();
    runtime.on("deltaSubmitted", this.#onLocalDelta, this);
  }

  #onLocalDelta(dds: DDS, delta: Delta, undo: Delta | null)
  {
    if (!undo)
      return;

    this.#activeTransaction.add({ targetId: nn(dds.id), delta: undo });
  }

  hasUncommittedChanges()
  {
    return !this.#activeTransaction.isEmpty();
  }

  get canUndo()
  {
    return this.#undoStack.length > 0;
  }

  get canRedo()
  {
    return this.#redoStack.length > 0;
  }

  commit()
  {
    if (this.#activeTransaction.isEmpty())
      return false;

    this.#undoStack.push(this.#activeTransaction);
    if (this.#redoStack.length > 0)
      this.#redoStack.length = 0;

    this.#activeTransaction = new Transaction();

    this.emit("commit");

    return true;
  }

  undo()
  {
    this.commit();

    const transaction = this.#undoStack.pop();
    if (!transaction)
      return false;

    for (const entry of transaction.entries.toReversed())
      this.runtime.replayDelta(entry.targetId, entry.delta);

    if (!this.#activeTransaction.isEmpty())
    {
      this.#redoStack.push(this.#activeTransaction);
      this.#activeTransaction = new Transaction();
    }

    this.emit("undo");

    return true;
  }

  redo()
  {
    this.commit();

    const transaction = this.#redoStack.pop();
    if (!transaction)
      return false;

    for (const entry of transaction.entries.toReversed())
      this.runtime.replayDelta(entry.targetId, entry.delta);

    if (!this.#activeTransaction.isEmpty())
    {
      this.#undoStack.push(this.#activeTransaction);
      this.#activeTransaction = new Transaction();
    }

    this.emit("redo");

    return true;
  }

  dispose()
  {
    this.runtime.off("deltaSubmitted", this.#onLocalDelta, this);
  }
}

interface HistoryEntry
{
  readonly targetId: string,
  readonly delta: Delta,
}


class Transaction
{
  readonly entries: HistoryEntry[] = [];

  add(entry: HistoryEntry)
  {
    this.entries.push(entry);
  }

  isEmpty()
  {
    return this.entries.length === 0;
  }
}
