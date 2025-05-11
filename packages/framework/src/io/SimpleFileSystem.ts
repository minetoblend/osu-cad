import { EventEmitter } from "pixi.js";
import type { FileEvents, FileSystemEvents, IWritableFile, IWritableFileSystem } from "./IFileSystem";

export interface SimpleFileSystemOptions
{
  caseSensitive: boolean
}

export class SimpleFileSystem extends EventEmitter<FileSystemEvents> implements IWritableFileSystem
{
  public static defaultOptions = {
    caseSensitive: false,
  } satisfies SimpleFileSystemOptions;

  public readonly caseSensitive: boolean;

  private readonly _files = new Map<string, SimpleFile>();

  constructor(options: Partial<SimpleFileSystemOptions> = {})
  {
    super();

    const opts = { ...SimpleFileSystem.defaultOptions, ...options };

    this.caseSensitive = opts.caseSensitive;
  }

  public entries(): IWritableFile[]
  {
    return [...this._files.values()];
  }

  public get(path: string): IWritableFile | undefined
  {
    path = this._normalizePath(path);

    return this._files.get(path);
  }

  async create(path: string, data: ArrayBuffer): Promise<IWritableFile>
  {
    let file = this.get(this._normalizePath(path));

    if (!file)
    {
      this._files.set(this._normalizePath(path), file = new SimpleFile(this, path, data));

      this.emit("added", path, file);
    }
    else
    {
      await file.write(data);
    }

    return file;
  }

  async update(path: string, data: ArrayBuffer): Promise<IWritableFile>
  {
    path = this._normalizePath(path);

    const file = this.get(path);

    if (!file)
      throw new Error(`File not found: "${path}"`);

    await file.write(data);

    // event is handled by the file itself

    return file;
  }

  async delete(path: string): Promise<boolean>
  {
    path = this._normalizePath(path);

    const file = this.get(path);
    if (!file)
      return false;

    this._files.delete(path);

    this.emit("removed", file.path);
    file.emit("removed");

    return true;
  }

  private _normalizePath(path: string)
  {
    path = path.trim();

    if (!this.caseSensitive)
      path = path.toLowerCase();

    return path;
  }
}

export class SimpleFile extends EventEmitter<FileEvents> implements IWritableFile
{
  constructor(
    private readonly fs: SimpleFileSystem,
    readonly path: string,
    private data: ArrayBuffer,
  )
  {
    super();
  }

  async read(): Promise<ArrayBuffer>
  {
    return this.data;
  }

  async write(data: ArrayBuffer): Promise<void>
  {
    this.data = data;

    this.fs.emit("changed", this.path, this);
    this.emit("changed");
  }

  async delete()
  {
    return this.fs.delete(this.path);
  }
}
