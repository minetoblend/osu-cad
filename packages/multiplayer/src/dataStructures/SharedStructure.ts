import type { ISequencedDocumentMessage } from '../interfaces/messages';
import type { ISummary } from './ISummary';
import type { Transaction, TransactionEntry } from './Transaction';
import { objectId } from '../utils/objectId';

export abstract class SharedStructure<TMutation = never, TSummary extends ISummary = any> {
  id = objectId();

  #updateHandler: UpdateHandler | null = null;

  protected get currentTransaction() {
    return this.#updateHandler?.currentTransaction ?? null;
  }

  abstract process(message: ISequencedDocumentMessage, local: boolean): void;

  abstract replayOp(contents: unknown): void;

  protected submitMutation(mutation: TMutation, undoMutation?: TMutation, key?: string): TransactionEntry<TMutation> | undefined {
    return this.#updateHandler?.submit(this.id, mutation, undoMutation, key);
  }

  get isAttached() {
    return !!this.#updateHandler;
  }

  attach(updateHandler: UpdateHandler) {
    this.#updateHandler = updateHandler;
    for (const object of this.childObjects)
      updateHandler.attach(object);
  }

  detach() {
    if (!this.isAttached)
      return;

    for (const object of this.childObjects)
      object.detach();

    const updateHandler = this.#updateHandler;

    this.#updateHandler = null;

    updateHandler?.detach(this);
  }

  protected attachChild(child: SharedStructure<any>) {
    this.#updateHandler?.attach(child);
  }

  onTransactionCommit(transaction: Transaction) {
  }

  get childObjects(): readonly SharedStructure<any>[] {
    return [];
  }

  abstract createSummary(): TSummary;

  abstract initializeFromSummary(summary: TSummary): void;
}
