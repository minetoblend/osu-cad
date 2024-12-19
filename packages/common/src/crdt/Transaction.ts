export class Transaction {
  get isEmpty() {
    return this.entries.length === 0;
  }

  entries: TransactionEntry[] = [];

  addEntry(entry: TransactionEntry) {
    this.entries.push(entry);
  }

  updateEntry(entry: TransactionEntry, fn: () => void) {
  }

  cleanup() {

  }
}

export class TransactionEntry<T = any> {
  constructor(
    readonly targetId: string,
    public undoMutation: T,
  ) {
  }
}
