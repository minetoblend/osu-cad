import { DeltaConnection } from "./DeltaConnection.js";
import { DocumentStorageService } from "./DocumentStorageService.js";
import { DeltaStorageService } from "./DeltaStorageService.js";

export class DocumentService
{
  public constructor(public readonly documentId: string)
  {
  }

  public async connectToStorage(): Promise<DocumentStorageService>
  {
    return new DocumentStorageService(this.documentId);
  }

  public async connectToDeltaStorage(): Promise<DeltaStorageService>
  {
    return new DeltaStorageService(this.documentId);
  }

  public connectToDeltaStream(): Promise<DeltaConnection>
  {
    return DeltaConnection.create(this.documentId);
  }
}

export class DocumentServiceFactory
{
  public async createDocumentService(documentId: string)
  {
    return new DocumentService(documentId);
  }
}
