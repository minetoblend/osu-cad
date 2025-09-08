

export interface ISummaryReference
{
  blobId: string
  sequenceNumber: number
  version: number
}

export class LocalDocumentStorage
{
  #summaries = new Map<string, ISummaryReference[]>();

  public async writeSummary(documentId: string, blobId: string, sequenceNumber: number)
  {
    const summaries = this.#summaries.get(documentId);

    if (!summaries)
    {
      this.#summaries.set(documentId, [{
        blobId,
        sequenceNumber,
        version: 1,
      }]);

      return 1;
    }
    else
    {
      const version = (summaries[summaries.length - 1]?.version ?? 0) + 1;

      summaries.push({
        blobId,
        sequenceNumber,
        version,
      });

      return version;
    }
  }

  public async readSummary(documentId: string, version?: number): Promise<ISummaryReference | undefined>
  {
    const summaries = this.#summaries.get(documentId);

    if (!summaries || !summaries.length)
      return undefined;

    if (version === undefined)
      return summaries[summaries.length - 1];

    return summaries.find(it => it.version === version);
  }
}
