import type { IRemoteDocumentMessage } from "@osucad/multiplayer-protocol";

export class DeltaStorageService
{
  public constructor(
    public readonly documentId: string,
    private readonly endpoint: string,
  )
  {
  }

  public async getDeltas(start: number, end?: number): Promise<IRemoteDocumentMessage[]>
  {
    return await fetch(`${this.endpoint}/api/blobs/api/deltas/${this.documentId}?start=${start}${end ? `&end=${end}` : ""}`).then(res => res.json());
  }
}
