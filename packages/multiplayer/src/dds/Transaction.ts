export class Transaction {
  get isEmpty() {
    return this.entries.length === 0;
  }

  entries: TransactionEntry[] = [];

  #entryMap = new Map<string, TransactionEntry>();

  getEntry(key: string): TransactionEntry | undefined {
    return this.#entryMap.get(key);
  }

  addEntry(entry: TransactionEntry, key?: string) {
    this.entries.push(entry);
    if (key) {
      const existing = this.#entryMap.get(key);
      if (existing)
        this.entries.splice(this.entries.indexOf(existing), 1);

      this.#entryMap.set(key, entry);
    }
  }
}

export class TransactionEntry<T = any> {
  constructor(
    readonly targetId: string,
    public undoMutation: T,
  ) {
  }
}
