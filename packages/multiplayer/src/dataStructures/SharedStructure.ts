import type { MutationContext } from './MutationContext';
import type { Transaction, TransactionEntry } from './Transaction';
import type { UpdateHandler } from './UpdateHandler';
import { objectId } from '../../../common/src/utils/objectId';

export abstract class SharedStructure<TMutation = never> {
  id = objectId();

  #updateHandler: UpdateHandler | null = null;

  protected get currentTransaction() {
    return this.#updateHandler?.currentTransaction ?? null;
  }

  abstract handle(mutation: TMutation, ctx: MutationContext): TMutation | null | void;

  ack(mutation: TMutation) {}

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
}
