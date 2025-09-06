import type { IMessageProcessorFactory } from "./IMessageProcessorFactory.js";
import { DocumentPartition } from "./DocumentPartition.js";
import type { QueuedMessage } from "./QueuedMessage.js";

export class PartitionManager
{
  public constructor(
    private readonly processorFactory: IMessageProcessorFactory,
  )
  {
  }

  public process(
    documentId: string,
    message: QueuedMessage,
  )
  {
    const partition = this.getPartition(documentId);

    partition.process(message);
  }

  private readonly partitions = new Map<string, DocumentPartition>();

  private getPartition(documentId: string)
  {
    let partition = this.partitions.get(documentId);

    if (!partition)
    {
      partition = new DocumentPartition(documentId, this.processorFactory);

      this.partitions.set(documentId, partition);
    }

    return partition;
  }
}
