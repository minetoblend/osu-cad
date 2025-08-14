import type { IClientEndpoints } from "./IClientEndpoints.js";
import { DocumentService } from "./DocumentService.js";
import type { IDocumentService } from "@osucad/multiplayer-client-definitions";

export class DocumentServiceFactory
{
  constructor(readonly endpoints: IClientEndpoints)
  {
  }

  async createDocumentService(documentId: string): Promise<IDocumentService>
  {
    return new DocumentService(documentId, this.endpoints);
  }
}
