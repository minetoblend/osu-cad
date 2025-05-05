import type { EventEmitter } from "pixi.js";

export interface FileSystemEvents
{
  added: [string, IFile];
  changed: [string, IFile];
  removed: [string];
}

export interface IFileSystem extends EventEmitter<FileSystemEvents>
{
  entries(): IFile[];

  get(path: string): IFile | undefined;
}

export interface IWritableFileSystem extends IFileSystem
{
  entries(): IWritableFile[];

  get(path: string): IWritableFile | undefined;

  create(path: string, data: ArrayBuffer): Promise<IWritableFile>;

  update(path: string, data: ArrayBuffer): Promise<IWritableFile>;

  delete(path: string): Promise<boolean>;
}

export interface FileEvents
{
  changed: [];
  removed: [];
}

export interface IFile extends EventEmitter<FileEvents>
{
  readonly path: string;

  read(): Promise<ArrayBuffer>;
}

export interface IWritableFile extends IFile
{
  write(data: ArrayBuffer): Promise<void>;

  delete(): Promise<boolean>;
}

