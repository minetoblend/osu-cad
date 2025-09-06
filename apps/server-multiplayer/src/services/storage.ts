
import type { IFullDocumentSummary } from "@osucad/multiplayer-core";

export interface IVersionedSummary
{
  summary: IFullDocumentSummary
  version: number
}

export class LocalDocumentStorage
{
  #summaries = new Map<string, IVersionedSummary[]>();

  public async writeSummary(documentId: string, summary: IFullDocumentSummary)
  {
    const summaries = this.#summaries.get(documentId);

    if (!summaries)
    {
      this.#summaries.set(documentId, [{
        summary,
        version: 1,
      }]);

      return 1;
    }
    else
    {
      const version = (summaries[summaries.length - 1]?.version ?? 0) + 1;

      summaries.push({
        summary,
        version,
      });

      return version;
    }
  }

  public async readSummary(documentId: string, version?: number): Promise<IVersionedSummary | undefined>
  {
    const summaries = this.#summaries.get(documentId);

    if (!summaries || !summaries.length)
      return undefined;

    if (version === undefined)
      return summaries[summaries.length - 1];

    return summaries.find(it => it.version === version);
  }
}
