import type { EditorBeatmap } from '../editor/EditorBeatmap';
import type { AbstractCrdt } from './AbstractCrdt';
import { Action, BindableBoolean, Component } from 'osucad-framework';
import { Transaction, TransactionEntry } from './Transaction';

export class UpdateHandler extends Component {
  constructor(
    readonly editorBeatmap: EditorBeatmap<any>,
  ) {
    super();
  }

  readonly canUndo = new BindableBoolean();

  readonly canRedo = new BindableBoolean();

  readonly beforeUndo = new Action();

  readonly afterUndo = new Action();

  readonly beforeRedo = new Action();

  readonly afterRedo = new Action();

  readonly commandApplied = new Action();

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

    this.commandApplied.emit();

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

    this.#updateBindables();
  }

  addUndoAction(action: () => void) {
    this.currentTransaction.customUndoActions.push(action);
  }

  undoCurrentTransaction() {
    const transaction = this.currentTransaction;

    if (transaction.isEmpty)
      return;

    this.beforeUndo.emit();

    for (const entry of transaction.entries.toReversed()) {
      const target = this.objects.get(entry.targetId);
      target?.handle(entry.undoMutation);
    }

    this.#currentTransaction = new Transaction();
    this.#updateBindables();

    this.afterUndo.emit();
  }

  undo() {
    if (!this.currentTransaction.isEmpty) {
      this.undoCurrentTransaction();
      return true;
    }

    const transaction = this.#undoStack.pop();
    if (!transaction)
      return false;

    this.beforeUndo.emit();

    const redoTransaction = new Transaction();

    for (const entry of transaction.entries.toReversed()) {
      const target = this.objects.get(entry.targetId);
      const redoMutation = target?.handle(entry.undoMutation);
      if (redoMutation)
        redoTransaction.addEntry(new TransactionEntry(entry.targetId, redoMutation));
    }

    this.commandApplied.emit();

    transaction.customUndoActions.forEach(action => action());

    if (!redoTransaction.isEmpty)
      this.#redoStack.push(redoTransaction);

    this.#updateBindables();

    this.afterUndo.emit();

    return true;
  }

  redo() {
    const transaction = this.#redoStack.pop();
    if (!transaction)
      return false;

    this.beforeRedo.emit();

    const undoTransaction = new Transaction();

    for (const entry of transaction.entries.toReversed()) {
      const target = this.objects.get(entry.targetId);
      const redoMutation = target?.handle(entry.undoMutation);
      if (redoMutation)
        undoTransaction.addEntry(new TransactionEntry(entry.targetId, redoMutation));
    }

    this.commandApplied.emit();

    if (!undoTransaction.isEmpty)
      this.#undoStack.push(undoTransaction);

    this.#updateBindables();

    this.afterRedo.emit();

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

  #updateBindables() {
    this.canUndo.value = this.#undoStack.length > 0;
    this.canRedo.value = this.#redoStack.length > 0;
  }
}
