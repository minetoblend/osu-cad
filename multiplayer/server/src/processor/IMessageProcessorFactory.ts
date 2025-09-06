import type { DocumentMessageProcessor } from "./DocumentMessageProcessor.js";

export interface IMessageProcessorFactory
{
  create(
    documentId: string,
  ): Promise<DocumentMessageProcessor>
}
