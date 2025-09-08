import type { IRemoteSignalMessage } from "@osucad/multiplayer-protocol";
import { type IRemoteDocumentMessage } from "@osucad/multiplayer-protocol";
import type { IProducer } from "../types/index.js";
import { ClientManager } from "./ClientManager.js";
import type { IProcessorSnapshot } from "./IProcessorSnapshot.js";
import type { QueuedMessage } from "./QueuedMessage.js";


export class DocumentMessageProcessor
{
  private readonly clientManager = new ClientManager();

  public constructor(
    public readonly documentId: string,
    private readonly deltasProducer: IProducer<IRemoteDocumentMessage>,
    private readonly signalsProducer: IProducer<IRemoteSignalMessage>,
    snapshot: IProcessorSnapshot | undefined,
  )
  {
    if (snapshot)
    {
      this.sequenceNumber = snapshot.sequenceNumber;

      for (const client of snapshot.clients)
        this.clientManager.upsertClient(client.clientId);
    }
  }

  private sequenceNumber = 0;

  public async process(message: QueuedMessage)
  {
    switch (message.type)
    {
    case "client_join":
      await this.processClientJoin(message);
      break;
    case "client_leave":
      await this.processClientLeave(message);
      break;
    case "deltas":
      await this.processDeltas(message);
      break;
    case "signal":
      await this.processSignal(message);
      break;
    }
  }

  private async processDeltas(message: QueuedMessage.Deltas)
  {
    await this.deltasProducer.send({
      type: "deltas",
      clientId: message.clientId,
      content: message.content,
      sequenceNumber: this.nextSequenceNumber(),
    });
  }

  private async processSignal(message: QueuedMessage.Signal)
  {
    await this.signalsProducer.send({
      ...message.content,
      clientId: message.clientId,
    });
  }

  private async processClientJoin(
    message: QueuedMessage.ClientJoin,
  )
  {
    if (!this.clientManager.upsertClient(message.client.clientId))
      return;

    await this.deltasProducer.send({
      type: "client_join",
      content: message.client,
      sequenceNumber: this.nextSequenceNumber(),
    });
  }

  private async processClientLeave(
    message: QueuedMessage.ClientLeave,
  )
  {
    if (!this.clientManager.removeClient(message.clientId))
      return;

    await this.deltasProducer.send({
      type: "client_leave",
      content: message.clientId,
      sequenceNumber: this.nextSequenceNumber(),
    });
  }

  private nextSequenceNumber()
  {
    return ++this.sequenceNumber;
  }

  private createSnapshot(): IProcessorSnapshot
  {
    return {
      sequenceNumber: this.sequenceNumber,
      clients: this.clientManager.createSnapshot(),
    };
  }
}
