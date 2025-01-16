export interface IFile {
  readonly name: string;

  getData(): Promise<ArrayBuffer>;

  getDataSync(): ArrayBuffer | null;

  dispose(): void;
}
