import type { IEditorDocumentSummary } from "@osucad/editor";

export interface ISummaryWithSequenceNumber
{
  summary: IEditorDocumentSummary
  sequenceNumber: number
  version: number
}
export class LocalDocumentStorage
{
  #summaries = new Map<string, ISummaryWithSequenceNumber[]>();

  public async writeSummary(documentId: string, summary: IEditorDocumentSummary, sequenceNumber: number)
  {
    const summaries = this.#summaries.get(documentId);

    if (!summaries)
    {
      this.#summaries.set(documentId, [{
        sequenceNumber,
        summary,
        version: 1,
      }]);

      return 1;
    }
    else
    {
      const version = (summaries[summaries.length - 1]?.version ?? 0) + 1;

      summaries.push({
        sequenceNumber,
        summary,
        version,
      });

      return version;
    }
  }

  public async readSummary(documentId: string, version?: number)
  {
    const summaries = this.#summaries.get(documentId);

    if (!summaries || !summaries.length)
      return undefined;

    if (version === undefined)
      return summaries[summaries.length - 1];

    return summaries.find(it => it.version === version);
  }
}
