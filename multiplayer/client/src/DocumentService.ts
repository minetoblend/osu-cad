import { DeltaConnection } from "./DeltaConnection.js";
import { DeltaStorageService } from "./DeltaStorageService.js";
import { DocumentStorageService } from "./DocumentStorageService.js";

export class DocumentService
{
  public constructor(
    public readonly documentId: string,
    private readonly endpoint: string,
  )
  {
  }

  public async connectToStorage(): Promise<DocumentStorageService>
  {
    return new DocumentStorageService(this.documentId, this.endpoint);
  }

  public async connectToDeltaStorage(): Promise<DeltaStorageService>
  {
    return new DeltaStorageService(this.documentId, this.endpoint);
  }

  public connectToDeltaStream(): Promise<DeltaConnection>
  {
    return DeltaConnection.create(this.documentId, this.endpoint);
  }
}

export class DocumentServiceFactory
{
  public constructor(private readonly endpoint: string)
  {
  }

  public async createDocumentService(documentId: string)
  {
    return new DocumentService(documentId, this.endpoint);
  }
}
