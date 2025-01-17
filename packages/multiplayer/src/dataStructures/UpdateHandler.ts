import type { IMutation } from '../protocol/IMutation';
import type { MutationContext } from './MutationContext';
import type { SharedStructure } from './SharedStructure';
import { Action, BindableBoolean, Component } from '@osucad/framework';
import { MutationSource } from './MutationSource';
import { Transaction, TransactionEntry } from './Transaction';

export class UpdateHandler extends Component {
  constructor(
    readonly root: SharedStructure,
  ) {
    super();
  }

  readonly canUndo = new BindableBoolean();

  readonly canRedo = new BindableBoolean();

  readonly beforeUndo = new Action();

  readonly afterUndo = new Action();

  readonly beforeRedo = new Action();

  readonly afterRedo = new Action();

  readonly commandApplied = new Action<IMutation>();

  #currentTransaction = new Transaction();

  get currentTransaction() {
    return this.#currentTransaction;
  }

  protected override loadComplete() {
    super.loadComplete();
    this.attach(this.root);
  }

  readonly #undoStack: Transaction[] = [];
  readonly #redoStack: Transaction[] = [];

  protected onMutationSubmitted(targetId: string, mutation: any) {}

  version = 0;

  submit(target: string, mutation: any, undoMutation?: any, key?: string) {
    this.onMutationSubmitted(target, mutation);

    this.commandApplied.emit({ target, data: mutation });

    if (undoMutation) {
      const entry = new TransactionEntry(target, undoMutation);
      this.currentTransaction.addEntry(entry, key);

      return entry;
    }
    return undefined;
  }

  apply(mutation: IMutation, ctx: MutationContext): boolean {
    const target = this.objects.get(mutation.target);
    if (!target)
      return false;

    target.handle(mutation.data, ctx);

    return true;
  }

  commit(): boolean {
    const transaction = this.currentTransaction;

    if (transaction.isEmpty)
      return false;

    for (const entry of transaction.entries) {
      const target = this.objects.get(entry.targetId);
      target?.onTransactionCommit(transaction);
    }

    this.#redoStack.length = 0;
    this.#undoStack.push(transaction);
    this.#currentTransaction = new Transaction();

    this.#updateBindables();

    return true;
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
      target?.handle(entry.undoMutation, {
        source: MutationSource.Local,
        version: this.version,
      });
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
      const redoMutation = target?.handle(entry.undoMutation, {
        source: MutationSource.Local,
        version: this.version,
      });
      this.commandApplied.emit({ target: entry.targetId, data: entry.undoMutation });

      if (redoMutation)
        redoTransaction.addEntry(new TransactionEntry(entry.targetId, redoMutation));
    }

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
      const redoMutation = target?.handle(entry.undoMutation, {
        source: MutationSource.Local,
        version: this.version,
      });
      this.commandApplied.emit({ target: entry.targetId, data: entry.undoMutation });

      if (redoMutation)
        undoTransaction.addEntry(new TransactionEntry(entry.targetId, redoMutation));
    }

    if (!undoTransaction.isEmpty)
      this.#undoStack.push(undoTransaction);

    this.#updateBindables();

    this.afterRedo.emit();

    return true;
  }

  readonly objects = new Map<string, SharedStructure<any>>();

  attach(object: SharedStructure<any>) {
    if (this.objects.has(object.id))
      return;

    this.objects.set(object.id, object);
    object.attach(this);
  }

  detach(object: SharedStructure<any>) {
    this.objects.delete(object.id);
    object.detach();
  }

  #updateBindables() {
    this.canUndo.value = this.#undoStack.length > 0;
    this.canRedo.value = this.#redoStack.length > 0;
  }
}
