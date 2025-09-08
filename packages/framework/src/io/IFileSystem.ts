import type { EventEmitter } from "eventemitter3";

export interface FileSystemEvents
{
  added(path: string, file: IFile): void;
  changed(path: string, file: IFile): void;
  removed(path: string): void
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
  changed(): void
  removed(): void
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

