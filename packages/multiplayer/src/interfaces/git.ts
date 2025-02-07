export interface IBlob {
  sha: string;
  size: number;
  content: string;
  encoding: 'utf-8' | 'base64';
}

export interface ICreateBlobParams {
  content: string;
  encoding: 'utf-8' | 'base64';
}

export interface ICreateBlobResponse {
  sha: string;
}
