import { EventEmitter } from "pixi.js";
import type { ZipEntry } from "unzipit";
import type { FileEvents, FileSystemEvents, IFile, IFileSystem } from "./IFileSystem";
import { SimpleFileSystem } from "./SimpleFileSystem";

export class ZipArchiveFileSystem extends EventEmitter<FileSystemEvents> implements IFileSystem
{
  public static async create(buffer: ArrayBuffer | Blob)
  {
    const { unzip } = await import("unzipit");

    const { entries } = await unzip(buffer);

    return new ZipArchiveFileSystem(entries);
  }

  public static async createMutable(buffer: ArrayBuffer | Blob): Promise<SimpleFileSystem>
  {
    const { unzip, setOptions } = await import("unzipit");

    setOptions({
      // workerURL: new URL("unzipit/dist/unzipit-worker.js", import.meta.url).href,
      // numWorkers: 4,
    });

    const { entries } = await unzip(buffer);
    const files = new SimpleFileSystem({ caseSensitive: false });

    const loadP: Promise<unknown>[] = [];

    for (const key in entries)
    {
      loadP.push(
          entries[key].arrayBuffer()
            .then(data => files.create(key, data)),
      );
    }

    await Promise.all(loadP);

    return files;
  }

  private readonly _entries = new Map<string, ZipArchiveFile>();

  private constructor(entries: Record<string, ZipEntry>)
  {
    super();

    for (const key in entries)
      this._entries.set(key, new ZipArchiveFile(entries[key]));
  }

  public entries(): IFile[]
  {
    return [...this._entries.values()];
  }

  public get(path: string): IFile | undefined
  {
    return this._entries.get(path);
  }
}

export class ZipArchiveFile extends EventEmitter<FileEvents> implements IFile
{
  public constructor(private readonly entry: ZipEntry)
  {
    super();
  }

  private _dataP?: Promise<ArrayBuffer>;

  public get path()
  {
    return this.entry.name;
  }

  public read(): Promise<ArrayBuffer>
  {
    this._dataP ??= this.entry.arrayBuffer();
    return this._dataP;
  }
}
