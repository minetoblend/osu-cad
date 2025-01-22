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

    return sequencedMessage;
  }

  appendSummary(clientId: number, summary: any) {
    return this.#latestSummary = {
      clientId,
      summary,
      sequenceNumber: ++this.#sequenceNumber,
    };
  }

  getMessagesSinceLastSummary() {
    return { summary: this.#latestSummary, ops: [...this.#ops] };
  }

  get opCount() {
    return this.#ops.length;
  }
}
