import type { MutationsSubmittedMessage, SubmitMutationsMessage } from '@osucad/multiplayer';

export class OrderingService {
  constructor(initialSummary: any) {
    this.#latestSummary = {
      clientId: -1,
      sequenceNumber: 0,
      summary: initialSummary,
    };
  }

  #latestSummary: {
    clientId: number;
    sequenceNumber: number;
    summary: any;
  };

  #ops: MutationsSubmittedMessage[] = [];

  #sequenceNumber = 0;

  get sequenceNumber() {
    return this.#sequenceNumber;
  }

  appendOps(clientId: number, message: SubmitMutationsMessage) {
    const sequencedMessage: MutationsSubmittedMessage = {
      mutations: message.mutations,
      clientId,
      version: message.version,
      sequenceNumber: ++this.#sequenceNumber,
    };

    this.#ops.push(sequencedMessage);

    this.#mutationCount += message.mutations.length;

    return sequencedMessage;
  }

  appendSummary(clientId: number, sequenceNumber: number, summary: any) {
    this.#ops = this.#ops.filter(op => op.sequenceNumber > sequenceNumber);

    this.#mutationCount = 0;

    for (const op of this.#ops)
      this.#mutationCount += op.mutations.length;

    return this.#latestSummary = {
      clientId,
      summary,
      sequenceNumber: ++this.#sequenceNumber,
    };
  }

  getMessagesSinceLastSummary() {
    return { summary: this.#latestSummary, ops: [...this.#ops] };
  }

  #mutationCount = 0;

  get mutationCount() {
    return this.#mutationCount;
  }
}
