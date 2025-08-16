import { DeltaConnection } from "./DeltaConnection.js";
import { DocumentStorageService } from "./DocumentStorageService.js";
import { DeltaStorageService } from "./DeltaStorageService.js";

export class DocumentService
{
  constructor(readonly documentId: string)
  {
  }

  async connectToStorage(): Promise<DocumentStorageService>
  {
    return new DocumentStorageService(this.documentId);
  }

  async connectToDeltaStorage(): Promise<DeltaStorageService>
  {
    return new DeltaStorageService(this.documentId);
  }

  connectToDeltaStream(): Promise<DeltaConnection>
  {
    return DeltaConnection.create(this.documentId);
  }
}

export class DocumentServiceFactory
{
  async createDocumentService(documentId: string)
  {
    return new DocumentService(documentId);
  }
}
