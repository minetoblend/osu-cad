import type { IRemoteDocumentMessage } from "@osucad/multiplayer-core";

export interface GetDeltasOptions
{
  start?: number;
  end?: number;
}

export interface IDeltaStorage
{
  append(documentId: string, deltas: IRemoteDocumentMessage[]): Promise<void>;

  getDeltas(documentId: string, options: GetDeltasOptions): Promise<IRemoteDocumentMessage[]>;
}

export class LocalDeltaStore implements IDeltaStorage
{
  readonly #deltas = new Map<string, IRemoteDocumentMessage[]>();

  public async append(documentId: string, deltas: IRemoteDocumentMessage[]): Promise<void>
  {
    if (deltas.length === 0)
      return;

    const existing = this.#deltas.get(documentId);

    if (existing)
    {
      const lastDelta = existing[existing.length - 1];

      if (lastDelta && deltas[0].sequenceNumber !== lastDelta.sequenceNumber + 1)
        throw new Error("sequence number mismatch");

      existing.push(...deltas);
    }
    else
    {
      this.#deltas.set(documentId, deltas);
    }
  }

  public async getDeltas(documentId: string, options: {
    start?: number;
    end?: number;
  }): Promise<IRemoteDocumentMessage[]>
  {
    const deltas = this.#deltas.get(documentId);
    if (!deltas)
      return [];

    const { start, end } = options;

    if (start === undefined && end === undefined)
      return deltas;

    return deltas.filter(delta =>
    {
      if (start !== undefined && delta.sequenceNumber < start)
        return false;

      if (end !== undefined && delta.sequenceNumber >= end)
        return false;

      return true;
    });
  }
}
