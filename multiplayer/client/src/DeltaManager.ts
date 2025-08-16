import type { IAttachInfo, IDocumentMessage, IRemoteSignalMessage } from "@osucad/multiplayer-protocol";
import { type IRemoteDocumentMessage, MessageType } from "@osucad/multiplayer-protocol";
import { DeltaQueue } from "./DeltaQueue.js";
import { DeltaCompressor, type DocumentRuntime } from "@osucad/multiplayer-core";
import type { DeltaConnection } from "./DeltaConnection.js";
import type { Audience } from "./Audience.js";

export class DeltaManager
{
  readonly deltaCompressor = new DeltaCompressor();
  attachedObjects: IAttachInfo[] = [];

  constructor(
    readonly runtime: DocumentRuntime,
    readonly audience: Audience,
  )
  {
    runtime.on("deltaSubmitted", (dds, delta) => this.deltaCompressor.push(dds.id, delta));
    runtime.on("attached", (dds, summary) => this.attachedObjects.push({ id: dds.id, summary }));
    runtime.on("signalSubmitted", (dds, type, content) => this.#connection?.submitSignal({ target: dds.id, type, content }));
  }

  #connection?: DeltaConnection;

  setConnected(connection: DeltaConnection)
  {
    this.#connection = connection;

    for (const client of connection.clients)
      this.audience.addMember(client);

    this.audience.setOwnClientId(connection.clientId);

    connection.on("deltas", deltas => this.inbound.push(deltas));
    connection.on("signal", signal => this.inboundSignal.push(signal));
    connection.on("clientJoin", client => this.audience.addMember(client));
    connection.on("clientLeave", client => this.audience.removeMember(client.clientId));
  }

  readonly inbound = new DeltaQueue<IRemoteDocumentMessage[]>((messages) =>
  {
    for (const message of messages)
    {
      const local = this.#connection!.clientId === message.clientId;
      this.runtime.process(message, local);
    }
  });

  readonly inboundSignal = new DeltaQueue<IRemoteSignalMessage>(message =>
  {
    this.runtime.processSignal(message, message.clientId === this.#connection!.clientId);
  });

  resume()
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
    }, 50);
  }
}
