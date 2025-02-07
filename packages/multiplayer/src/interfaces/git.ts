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

export interface ICommit {
  sha: string;
  message: string;
  author: IAuthor;
  committer: IAuthor;
  tree: { sha: string };
  parents: { sha: string }[];
}

export interface IAuthor {
  name: string;
  email: string;
  date: string;
}
