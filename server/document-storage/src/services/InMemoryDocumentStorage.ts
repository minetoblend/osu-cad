import type { ICommit, IDocument, IDocumentStorage, ISummaryTree } from '@osucad/multiplayer';

export class InMemoryDocumentStorage implements IDocumentStorage {
  async getDocument(documentId: string): Promise<IDocument | null> {
    throw new Error('Method not implemented.');
  }

  async getLatestVersion(documentId: string): Promise<ICommit | null> {
    throw new Error('Method not implemented.');
  }

  getVersion(documentId: string, sha: string): Promise<ICommit> {
    throw new Error('Method not implemented.');
  }

  createDocument(documentId: string, summary: ISummaryTree, sequenceNumber: number): Promise<IDocument> {
    throw new Error('Method not implemented.');
  }
}
