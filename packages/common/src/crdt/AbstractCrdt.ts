import type { Transaction, TransactionEntry } from './Transaction';
import type { UpdateHandler } from './UpdateHandler';
import { objectId } from '../utils/objectId';

export abstract class AbstractCrdt<TMutation = never> {
  id = objectId();

  #updateHandler: UpdateHandler | null = null;

  protected get currentTransaction() {
    return this.#updateHandler?.currentTransaction ?? null;
  }

  abstract handle(mutation: TMutation): TMutation | null | void;

  protected submitMutation(mutation: TMutation, undoMutation?: TMutation): TransactionEntry<TMutation> | undefined {
    return this.#updateHandler?.submit(this.id, mutation, undoMutation);
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

  protected attachChild(child: AbstractCrdt<any>) {
    this.#updateHandler?.attach(child);
  }

  onTransactionCommit(transaction: Transaction) {
  }

  get childObjects(): readonly AbstractCrdt<any>[] {
    return [];
  }
}
