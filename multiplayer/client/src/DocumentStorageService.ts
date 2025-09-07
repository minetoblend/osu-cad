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

  public async readBlob(id: string): Promise<ArrayBuffer>
  {
    const response = await fetch(`/api/blobs/${id}`);

    if (!response.ok)
      throw new Error(`Blob ${id} not found`);

    return response.arrayBuffer();
  }

  public async createBlob(data: ArrayBufferLike): Promise<{ id: string }>
  {
    const buffer = new ArrayBuffer(data.byteLength);

    new Uint8Array(buffer).set(new Uint8Array(data));

    return await fetch("/api/blobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    }).then(res => res.json());
  }
}
