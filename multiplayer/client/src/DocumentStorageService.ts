import type { IDocumentSummary } from "@osucad/multiplayer-protocol";

export class DocumentStorageService
{
  constructor(readonly documentId: string)
  {
  }

  async getSummary(): Promise<{
    summary: IDocumentSummary,
    sequenceNumber: number
  }>
  {
    return await fetch(`/api/summary/${this.documentId}`).then(res => res.json());
  }
}
