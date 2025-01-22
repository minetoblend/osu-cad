import type { MutationsSubmittedMessage, SubmitMutationsMessage } from '@osucad/multiplayer';
import type Redis from 'ioredis';

export interface SummaryMessage {
  clientId: number;
  sequenceNumber: string;
  summary: any;
}

export class OrderingService {
  constructor(
    readonly redis: Redis,
    readonly id: string,
    initialSummary: any,
  ) {
    this.initialSummary = {
      clientId: -1,
      sequenceNumber: '-',
      summary: initialSummary,
    };
  }

  get #prefix() {
    return `osucad:edit:${this.id}`;
  }

  get #streamKey() {
    return `${this.#prefix}:ops`;
  }

  get #summaryKey() {
    return `${this.#prefix}:summary`;
  }

  get #mutationCountKey() {
    return `${this.#prefix}:mutationCount`;
  }

  get #sequenceKey() {
    return `${this.#prefix}:seq`;
  }

  async init() {
    const didCreateSummary = await this.redis.set(this.#summaryKey, JSON.stringify(this.initialSummary), 'NX');

    if (didCreateSummary === 'OK')
      console.log('created a new summary');
  }

  initialSummary: SummaryMessage;

  async appendOps(clientId: number, message: SubmitMutationsMessage) {
    const sequencedMessage: Omit<MutationsSubmittedMessage, 'sequenceNumber'> = {
      mutations: message.mutations,
      clientId,
      version: message.version,
    };

    const sequenceNumber = await this.redis.xadd(this.#streamKey, '*', 'message', JSON.stringify(sequencedMessage));

    if (!sequenceNumber)
      throw new Error('Failed to append to stream');

    const mutationCount = await this.redis.incrby(this.#mutationCountKey, message.mutations.length);

    return {
      mutationCount,
      sequencedMessage: {
        ...sequencedMessage,
        sequenceNumber,
      },
    };
  }

  async appendSummary(clientId: number, sequenceNumber: string, summary: any) {
    const summaryMessage: SummaryMessage = {
      clientId,
      summary,
      sequenceNumber,
    };

    this.redis.set(this.#summaryKey, JSON.stringify(summaryMessage));
    this.redis.xtrim(this.#streamKey, 'MINID', sequenceNumber);
  }

  async getMessagesSinceLastSummary() {
    const summaryString = await this.redis.get(this.#summaryKey);

    if (!summaryString)
      throw new Error('Could not find summary string');

    const summary = JSON.parse(summaryString);
    const opsSinceLastSummary = await this.redis.xrange(this.#streamKey, '-', '+');

    const ops = opsSinceLastSummary.map(([id, fields]) =>
      JSON.parse(fields[1]),
    );

    return { summary, ops };
  }
}
