import type { IRemoteDocumentMessage } from "@osucad/multiplayer-protocol";

export class DeltaStorageService
{
  public constructor(public readonly documentId: string)
  {
  }

  public async getDeltas(start: number): Promise<IRemoteDocumentMessage[]>
  {
    return await fetch(`/api/deltas/${this.documentId}?start=${start}`).then(res => res.json());
  }
}
