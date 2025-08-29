import type { IRemoteDocumentMessage } from "@osucad/multiplayer-protocol";

export class DeltaStorageService
{
  public constructor(public readonly documentId: string)
  {
  }

  public async getDeltas(since: number): Promise<IRemoteDocumentMessage[]>
  {
    return await fetch(`/api/deltas/${this.documentId}?since=${since}`).then(res => res.json());
  }
}
