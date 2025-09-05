import type { IAttachInfo, IDocumentMessage, IRemoteSignalMessage } from "@osucad/multiplayer-protocol";
import { type IRemoteDocumentMessage, MessageType } from "@osucad/multiplayer-protocol";
import { DeltaQueue } from "./DeltaQueue.js";
import { DeltaCompressor, type DocumentRuntime } from "@osucad/multiplayer-core";
import type { DeltaConnection } from "./DeltaConnection.js";
import type { Audience } from "./Audience.js";
import type { DocumentStorageService } from "./DocumentStorageService.js";

export class DeltaManager
{
  public readonly deltaCompressor = new DeltaCompressor();
  public attachedObjects: IAttachInfo[] = [];

  public constructor(
    public readonly runtime: DocumentRuntime,
    public readonly audience: Audience,
  )
  {
    runtime.on("deltaSubmitted", (dds, delta) => this.deltaCompressor.push(dds.id, delta));
    runtime.on("attached", (dds, summary) => this.attachedObjects.push({ id: dds.id, summary }));
    runtime.on("signalSubmitted", (dds, type, content) => this.#connection?.submitSignal({ target: dds.id, type, content }));
  }

  #connection?: DeltaConnection;
  #storage?: DocumentStorageService;

  public setConnected(connection: DeltaConnection, storageService: DocumentStorageService)
  {
    this.#connection = connection;
    this.#storage = storageService;

    for (const client of connection.clients)
      this.audience.addMember(client);

    this.audience.setOwnClientId(connection.clientId);

    connection.on("deltas", deltas => this.inbound.push(deltas));
    connection.on("signal", signal => this.inboundSignal.push(signal));
    connection.on("clientJoin", client => this.audience.addMember(client));
    connection.on("clientLeave", client => this.audience.removeMember(client.clientId));
  }

  public readonly inbound = new DeltaQueue<IRemoteDocumentMessage[]>((messages) =>
  {
    for (const message of messages)
    {
      const local = this.#connection!.clientId === message.clientId;
      this.runtime.process(message, local);
      this.#sequenceNumber = message.sequenceNumber;
      if (local)
      {
        this.#deltasInFlight--;
      }
    }
  });

  public readonly inboundSignal = new DeltaQueue<IRemoteSignalMessage>(message =>
  {
    this.runtime.processSignal(message, message.clientId === this.#connection!.clientId);
  });

  #deltasInFlight = 0;
  #sequenceNumber = -1;
  #lastSummarySequenceNumber = -1;

  public resume()
  {
    this.inbound.resume();
    this.inboundSignal.resume();

    setInterval(() =>
    {
      if (this.attachedObjects.length === 0 && !this.deltaCompressor.hasDeltas())
        return;

      const messages: IDocumentMessage[] = [];

      if (this.attachedObjects.length > 0)
      {
        messages.push({
          type: MessageType.Attach,
          content: this.attachedObjects,
        });
        this.attachedObjects = [];
      }

      if (this.deltaCompressor.hasDeltas())
      {
        messages.push({
          type: MessageType.Delta,
          deltas: this.deltaCompressor.process(),
        });
      }

      this.#connection!.submitDeltas(messages);
      this.#deltasInFlight += messages.length;
    }, 50);

    setTimeout(this.#submitSummary, 30_000);
  }

  #submitSummary = async() =>
  {
    if (this.#deltasInFlight !== 0 || this.#sequenceNumber < 0 || this.#sequenceNumber !== this.#lastSummarySequenceNumber || this.deltaCompressor.hasDeltas())
    {
      setTimeout(this.#submitSummary, 5_000);
      return;
    }

    try
    {
      const summary = this.runtime.createSummary();

      this.#lastSummarySequenceNumber = this.#sequenceNumber;

      await this.#storage?.createSummary(summary, this.#sequenceNumber);
    }
    catch (e)
    {
      // TODO
      console.error(e);
    }

    setTimeout(this.#submitSummary, 30_000);
  };
}
