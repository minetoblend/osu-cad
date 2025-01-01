export interface IFile {
  readonly name: string;
  getData(): Promise<ArrayBuffer>;
}
