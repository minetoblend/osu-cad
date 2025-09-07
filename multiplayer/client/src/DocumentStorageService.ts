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

  public async readBlob(sha: string): Promise<ArrayBuffer>
  {
    const response = await fetch(`/api/blobs/${sha}`);

    if (!response.ok)
      throw new Error(`Blob ${sha} not found`);

    return response.arrayBuffer();
  }

  public async writeBlob(data: ArrayBuffer): Promise<{ sha: string }>
  {
    return await fetch("/api/blobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: data,
    }).then(res => res.json());
  }
}
