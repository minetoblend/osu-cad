import type { IRemoteDocumentMessage } from "@osucad/multiplayer-protocol";

export class DeltaStorageService
{
  constructor(readonly documentId: string)
  {
  }

  async getDeltas(since: number): Promise<IRemoteDocumentMessage[]>
  {
    return await fetch(`/api/deltas/${this.documentId}?since=${since}`).then(res => res.json());
  }
}
