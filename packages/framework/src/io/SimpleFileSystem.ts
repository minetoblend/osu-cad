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

  public caseSensitive: boolean;

  private readonly _files: SimpleFile[] = [];

  constructor(options: Partial<SimpleFileSystemOptions> = {})
  {
    super();

    const opts = { ...SimpleFileSystem.defaultOptions, ...options };

    this.caseSensitive = opts.caseSensitive;
  }

  public entries(): IWritableFile[]
  {
    return [...this._files];
  }

  public get(path: string): IWritableFile | undefined
  {
    path = this._normalizePath(path);

    if (!this.caseSensitive)
      path = path.toLowerCase();

    return this._files.find(file =>
        this.caseSensitive
            ? file.path === path
            : file.path.toLowerCase() === path,
    );
  }

  async create(path: string, data: ArrayBuffer): Promise<IWritableFile>
  {
    if (this.get(path))
      throw new Error(`File already exists: "${path}"`);

    const file = new SimpleFile(this, path, data);

    this._files.push(file);

    this.emit("added", path, file);

    return file;
  }

  async update(path: string, data: ArrayBuffer): Promise<IWritableFile>
  {
    const file = this.get(path);

    if (!file)
      throw new Error(`File not found: "${path}"`);

    await file.write(data);

    // event is handled by the file itself

    return file;
  }

  async delete(path: string): Promise<boolean>
  {
    const file = this.get(path);
    if (!file)
      return false;

    const index = this._files.indexOf(file as SimpleFile);
    this._files.splice(index, 1);

    this.emit("removed", file.path);

    return true;
  }

  private _normalizePath(path: string)
  {
    path = path.trim();

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
  }

  async delete()
  {
    return this.fs.delete(this.path);
  }
}
