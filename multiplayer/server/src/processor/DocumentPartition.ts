import { queue } from "async";
import type { QueuedMessage } from "./QueuedMessage.js";
import type { IMessageProcessorFactory } from "./IMessageProcessorFactory.js";
import type { DocumentMessageProcessor } from "./DocumentMessageProcessor.js";
import { EventEmitter } from "eventemitter3";

export interface DocumentPartitionEvents
{
  error(errorInfo: { error: any, recoverable: boolean }): void
}

export class DocumentPartition extends EventEmitter<DocumentPartitionEvents>
{
  private queue = queue(async (message: QueuedMessage) =>
  {
    await this.processor.process(message);
  });

  private processor!: DocumentMessageProcessor;

  public constructor(
    public readonly documentId: string,
    processorFactory: IMessageProcessorFactory,
  )
  {
    super();
    this.queue.pause();

    processorFactory.create(documentId).then(processor =>
    {
      this.processor = processor;
      this.queue.resume();
    }).catch(error =>
    {
      this.emit("error", {
        error,
        recoverable: false,
      });
    });
  }

  public process(message: QueuedMessage)
  {
    this.queue.push(message);
  }
}
