import type { IBlobStorage, ICreateBlobResponse } from "./BlobManager.js";

export class MemoryBlobStorage implements IBlobStorage
{
  private readonly blobs = new Map<string, ArrayBufferLike>();

  public async readBlob(id: string): Promise<ArrayBufferLike>
  {
    const blob = this.blobs.get(id);

    if (!blob)
      throw new Error(`Blob ${id} not found`);

    return cloneArrayBuffer(blob);
  }

  public async createBlob(blob: ArrayBufferLike): Promise<ICreateBlobResponse>
  {
    const id = crypto.randomUUID();

    this.blobs.set(id, cloneArrayBuffer(blob));

    return { id };
  }
}

function cloneArrayBuffer(buff: ArrayBufferLike)
{
  const copy = new ArrayBuffer(buff.byteLength);
  new Uint8Array(copy).set(new Uint8Array(buff));

  return copy;
}
