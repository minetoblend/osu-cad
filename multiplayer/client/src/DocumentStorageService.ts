import type { IFullDocumentSummary } from "@osucad/multiplayer-protocol";

export class DocumentStorageService
{
  public constructor(public readonly documentId: string)
  {
  }

  public async getSummary(): Promise<{
    summary: IFullDocumentSummary,
    version: number
  }>
  {
    return await fetch(`/api/summary/${this.documentId}`).then(res => res.json());
  }

  public async createSummary(
    summary: IFullDocumentSummary,
    sequenceNumber: number,
  ): Promise<number>
  {
    return await fetch(`/api/summary/${this.documentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ summary, sequenceNumber }),
    }).then(res => res.json());
  }
}
