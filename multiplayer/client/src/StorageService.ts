import type { ICreateBlobResponse, IDocumentStorageService } from "@osucad/multiplayer-client-definitions";
import type { IClientEndpoints } from "./IClientEndpoints.js";

export class StorageService implements IDocumentStorageService
{
  constructor(readonly endpoints: IClientEndpoints)
  {
  }

  async createBlob(data: ArrayBuffer): Promise<ICreateBlobResponse>
  {
    const response = await fetch(this.endpoints.blobs, {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });

    return await response.json();
  }

  async readBlob(id: string): Promise<ArrayBuffer>
  {
    const response = await fetch(`${this.endpoints.blobs}/${id}`, {
      method: "GET",
    });

    return await response.arrayBuffer();
  }

  dispose(): void
  {
  }
}
