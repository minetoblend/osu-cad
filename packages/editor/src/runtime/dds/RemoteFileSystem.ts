import type { IFile, IFileSystem } from "@osucad/framework";
import type { BlobHandle, BlobRef, DDSAttributes, IDecoder, IEncoder } from "@osucad/multiplayer-core";
import { Delta } from "@osucad/multiplayer-core";
import { DDS } from "@osucad/multiplayer-core";
import { EventEmitter } from "eventemitter3";

export type RemoteFileSystemMessage =
  | IWriteFile
  | IDeleteFile;

export interface IWriteFile
{
  type: "write"
  path: string
  blob: BlobRef
}

export interface IDeleteFile
{
  type: "delete"
  path: string
}

export interface IRemoteFileSystemSummary
{
  files: IRemoteFileSummary[]
}

export interface IRemoteFileSummary
{
  path: string
  blob: BlobRef
}

class WriteFileDelta extends Delta<IWriteFile>
{
  public constructor(
    public readonly path: string,
    public readonly blob: BlobRef,
  )
  {
    super();
  }

  public override encode(): IWriteFile
  {
    return {
      type: "write",
      path: this.path,
      blob: this.blob,
    };
  }
}

class DeleteFileDelta extends Delta<IDeleteFile>
{
  public constructor(
    public readonly path: string,
  )
  {
    super();
  }

  public override encode(): IDeleteFile
  {
    return {
      type: "delete",
      path: this.path,
    };
  }
}


export class RemoteFileSystem extends DDS<RemoteFileSystemMessage> implements IFileSystem
{
  public static attributes: DDSAttributes = {
    type: "@osucad/filesystem",
    version: 0,
  };

  public constructor()
  {
    super(RemoteFileSystem.attributes);
  }

  readonly #files: RemoteFile[] = [];

  public entries(): IFile[]
  {
    return this.#files;
  }

  public get(path: string)
  {
    return this.#files.find(it => it.path === path);
  }

  public async write(
    path: string,
    blob: ArrayBufferLike,
  )
  {
    // TODO: support doing this without runtime

    const handle = await this.runtime!.createBlob(blob);

    this.#createOrUpdateFile(path, handle);
  }

  protected override process(delta: RemoteFileSystemMessage, local: boolean): void
  {
    if (local)
      return;

    const entry = this.#files.find(it => it.path === delta.path);

    if (delta.type === "write")
    {
      const blob = this.decoder.decodeBlob(delta.blob);

      if (entry)
      {
        entry.updateBlobHandle(blob);
        this.emit("changed", entry);
      }
      else
      {
        const file = new RemoteFile(this, delta.path, blob);
        this.#files.push(file);
        this.emit("created", file);
      }
    }
  }

  protected override replay(delta: Delta): void
  {
    if (delta instanceof WriteFileDelta)
    {
      const blob = this.decoder.decodeBlob(delta.blob);

      this.#createOrUpdateFile(delta.path, blob);
    }

    if (delta instanceof DeleteFileDelta)
    {
      this.delete(delta.path);
    }
  }

  #createOrUpdateFile(
    path: string,
    blob: BlobHandle,
  )
  {
    const entry = this.#files.find(it => it.path === path);

    if (entry)
    {
      const oldValue = entry.blobHandle;

      if (!entry.updateBlobHandle(blob))
        return;

      this.submitDelta(
          new WriteFileDelta(path, this.encoder.encodeBlob(blob)),
          new WriteFileDelta(path, this.encoder.encodeBlob(oldValue)),
      );
    }
    else
    {
      const entry = new RemoteFile(this, path, blob);

      this.#files.push(entry);

      this.submitDelta(
          new WriteFileDelta(path, this.encoder.encodeBlob(blob)),
          new DeleteFileDelta(path),
      );
    }
  }

  public delete(path: string): boolean
  {
    const index = this.#files.findIndex(it => it.path === path);

    if (index < 0)
      return false;

    const entry = this.#files[index];
    this.#files.splice(index, 1);

    this.submitDelta(
        new DeleteFileDelta(path),
        new WriteFileDelta(path, this.encoder.encodeBlob(entry.blobHandle)),
    );

    return true;
  }

  public override createSummary(encoder: IEncoder): IRemoteFileSystemSummary
  {
    return {
      files: this.#files.map(it => it.createSummary(encoder)),
    };
  }

  public override load(summary: unknown, version: number, decoder: IDecoder): void
  {
    const { files } = summary as IRemoteFileSystemSummary;

    this.#files.length = 0;
    this.#files.push(...files.map(file =>
      new RemoteFile(
          this,
          file.path,
          decoder.decodeBlob(file.blob),
      ),
    ));
  }
}

export interface RemoteFileEvents
{
  changed(): void
  removed(): void
}

export class RemoteFile extends EventEmitter<RemoteFileEvents> implements IFile
{
  public constructor(
    public readonly fs: RemoteFileSystem,
    public readonly path: string,
    public blobHandle: BlobHandle,
  )
  {
    super();
  }

  public updateBlobHandle(handle: BlobHandle)
  {
    if (this.blobHandle.id === handle.id)
      return false;

    this.blobHandle = handle;
    this.emit("changed");
    return true;
  }

  public async read(): Promise<ArrayBuffer>
  {
    const data = await this.blobHandle.get();

    const copy = new ArrayBuffer(data.byteLength);
    new Uint8Array(copy).set(new Uint8Array(data));

    return copy;
  }

  public createSummary(encoder: IEncoder): IRemoteFileSummary
  {
    return {
      path: this.path,
      blob: encoder.encodeBlob(this.blobHandle),
    };
  }
}
