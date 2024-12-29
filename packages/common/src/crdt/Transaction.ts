export class Transaction {
  get isEmpty() {
    return this.entries.length === 0;
  }

  entries: TransactionEntry[] = [];

  addEntry(entry: TransactionEntry) {
    this.entries.push(entry);
  }

  customUndoActions: (() => void)[] = [];
}

export class TransactionEntry<T = any> {
  constructor(
    readonly targetId: string,
    public undoMutation: T,
  ) {
  }
}
