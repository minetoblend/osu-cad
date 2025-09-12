import type { IAttachInfo, IDocumentMessage, IRemoteSignalMessage } from "@osucad/multiplayer-protocol";
import { type IRemoteDocumentMessage, MessageType } from "@osucad/multiplayer-protocol";
import { DeltaQueue } from "./DeltaQueue.js";
import { DeltaCompressor, type DocumentRuntime } from "@osucad/multiplayer-core";
import type { DeltaConnection } from "./DeltaConnection.js";
import type { DocumentStorageService } from "./DocumentStorageService.js";
import type { ProtocolHandler } from "./ProtocolHandler.js";

export class DeltaManager
{
  public readonly deltaCompressor = new DeltaCompressor();
  public attachedObjects: IAttachInfo[] = [];
  public attachedBlobs: string[]= [];

  public constructor(
    public readonly runtime: DocumentRuntime,
    private readonly protocolHandler: ProtocolHandler,
  )
  {
    runtime.on("deltaSubmitted", (dds, delta) => this.deltaCompressor.push(dds.id, delta));
    runtime.on("attached", (dds, summary) => this.attachedObjects.push({ id: dds.id, summary }));
    runtime.on("signalSubmitted", (dds, type, content) => this.#connection?.submitSignal({ target: dds.id, type, content }));
    runtime.on("blobAttachSubmitted", id => this.attachedBlobs.push(id));
  }

  #connection?: DeltaConnection;
  #storage?: DocumentStorageService;

  public setConnected(connection: DeltaConnection, storageService: DocumentStorageService)
  {
    this.#connection = connection;
    this.#storage = storageService;

    this.inbound.push(connection.initialDeltas);

    connection.on("deltas", deltas => this.inbound.push(deltas));
    connection.on("signal", signal => this.inboundSignal.push(signal));
  }

  public readonly inbound = new DeltaQueue<IRemoteDocumentMessage[]>((messages) =>
  {
    for (const message of messages)
      this.protocolHandler.process(message);
  });

  public readonly inboundSignal = new DeltaQueue<IRemoteSignalMessage>(message =>
  {
    this.runtime.processSignal(message, message.clientId === this.#connection!.clientId);
  });

  public resume()
  {
    this.inbound.resume();
    this.inboundSignal.resume();

    setInterval(() =>
    {
      if (this.attachedObjects.length === 0 && !this.deltaCompressor.hasDeltas())
        return;

      const messages: IDocumentMessage[] = [];

      if (this.attachedBlobs.length > 0)
      {
        for (const id of this.attachedBlobs)
        {
          messages.push({
            type: MessageType.BlobAttach,
            id,
          });
        }

        this.attachedBlobs = [];
      }

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
    }, 50);
  }
}
