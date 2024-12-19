import type { EditorBeatmap } from '../editor/EditorBeatmap';
import type { AbstractCrdt } from './AbstractCrdt';
import { Component } from 'osucad-framework';
import { Transaction, TransactionEntry } from './Transaction';

export class UpdateHandler extends Component {
  constructor(
    readonly editorBeatmap: EditorBeatmap,
  ) {
    super();
  }

  #currentTransaction = new Transaction();

  get currentTransaction() {
    return this.#currentTransaction;
  }

  protected override loadComplete() {
    super.loadComplete();
    this.attach(this.editorBeatmap.beatmap);
  }

  readonly #undoStack: Transaction[] = [];
  readonly #redoStack: Transaction[] = [];

  protected onMutationSubmitted(targetId: string, mutation: any) {}

  submit(targetId: string, mutation: any, undoMutation?: any) {
    this.onMutationSubmitted(targetId, mutation);

    if (undoMutation) {
      const entry = new TransactionEntry(targetId, undoMutation);
      this.currentTransaction.addEntry(entry);

      return entry;
    }
    return undefined;
  }

  commit() {
    const transaction = this.currentTransaction;

    if (transaction.isEmpty)
      return;

    for (const entry of transaction.entries) {
      const target = this.objects.get(entry.targetId);
      target?.onTransactionCommit(transaction);
    }

    this.#redoStack.length = 0;
    this.#undoStack.push(transaction);
    this.#currentTransaction = new Transaction();
  }

  undoCurrentTransaction() {
    const transaction = this.currentTransaction;

    if (transaction.isEmpty)
      return;

    for (const entry of transaction.entries.toReversed()) {
      const target = this.objects.get(entry.targetId);
      target?.handle(entry.undoMutation);
    }

    this.#currentTransaction = new Transaction();
  }

  undo() {
    const transaction = this.#undoStack.pop();
    if (!transaction)
      return false;

    const redoTransaction = new Transaction();

    for (const entry of transaction.entries.toReversed()) {
      const target = this.objects.get(entry.targetId);
      const redoMutation = target?.handle(entry.undoMutation);
      if (redoMutation)
        redoTransaction.addEntry(new TransactionEntry(entry.targetId, redoMutation));
    }

    if (!redoTransaction.isEmpty)
      this.#redoStack.push(redoTransaction);

    return true;
  }

  redo() {
    const transaction = this.#redoStack.pop();
    if (!transaction)
      return false;

    const undoTransaction = new Transaction();

    for (const entry of transaction.entries.toReversed()) {
      const target = this.objects.get(entry.targetId);
      const redoMutation = target?.handle(entry.undoMutation);
      if (redoMutation)
        undoTransaction.addEntry(new TransactionEntry(entry.targetId, redoMutation));
    }

    if (!undoTransaction.isEmpty)
      this.#undoStack.push(undoTransaction);

    return true;
  }

  readonly objects = new Map<string, AbstractCrdt<any>>();

  attach(object: AbstractCrdt<any>) {
    if (this.objects.has(object.id))
      return;

    this.objects.set(object.id, object);
    object.attach(this);
  }

  detach(object: AbstractCrdt<any>) {
    this.objects.delete(object.id);
    object.detach();
  }
}
