import type { ICommit } from './git';
import type { ISummaryTree } from './summary';

export interface IDocumentStorage {
  getDocument(documentId: string): Promise<IDocument | null>;

  getLatestVersion(documentId: string): Promise<ICommit | null>;

  getVersion(documentId: string, sha: string): Promise<ICommit>;

  createDocument(
    documentId: string,
    summary: ISummaryTree,
  ): Promise<IDocument>;
}

export interface IDocument {
  version: string;
  createTime: number;
  documentId: string;
}
