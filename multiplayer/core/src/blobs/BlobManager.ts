import type { IBlobAttachMessagae } from "@osucad/multiplayer-protocol";
import type { DocumentRuntime } from "../runtime/DocumentRuntime.js";

export interface IBlobStorage
{
  readBlob(id: string): Promise<ArrayBufferLike>

  createBlob(blob: ArrayBufferLike): Promise<ICreateBlobResponse>
}

export interface ICreateBlobResponse
{
  id: string
}

export class BlobHandle
{
  public constructor(
    public readonly id: string,
    public get: () => Promise<ArrayBufferLike>,
  )
  {
  }
}

export class BlobManager
{
  public constructor(
    private readonly runtime: DocumentRuntime,
    private readonly storage: IBlobStorage,
  )
  {
  }

  private blobs = new Map<string, BlobHandle>();

  public async createBlob(blob: ArrayBufferLike)
  {
    const response = await this.storage.createBlob(blob);

    const handle = new BlobHandle(
        response.id,
        async () => blob,
    );

    this.blobs.set(handle.id, handle);

    this.runtime.submitBlobAttached(handle.id);

    return handle;
  }

  public procesBlobAttachMessage(message: IBlobAttachMessagae, local: boolean)
  {
    if (!local)
    {
      const handle = new BlobHandle(
          message.id,
          () => this.storage.readBlob(message.id),
      );

      this.blobs.set(message.id, handle);
    }
  }

  public load(blobIds: string[])
  {
    for (const id of blobIds)
    {
      this.blobs.set(id, new BlobHandle(
          id,
          () => this.storage.readBlob(id),
      ));
    }
  }

  public hasBlob(id: string)
  {
    return this.blobs.has(id);
  }

  public getBlob(id: string)
  {
    return this.blobs.get(id);
  }

  public createSummary()
  {
    return [...this.blobs.keys()];
  }
}
