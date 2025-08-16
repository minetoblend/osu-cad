import type { IAttachInfo, IDocumentMessage } from "@osucad/multiplayer-protocol";
import { type IRemoteDocumentMessage, MessageType } from "@osucad/multiplayer-protocol";
import { DeltaQueue } from "./DeltaQueue";
import { DeltaCompressor, type DocumentRuntime } from "@osucad/multiplayer-core";
import type { DeltaConnection } from "./DeltaConnection";

export class DeltaManager
{
  readonly deltaCompressor = new DeltaCompressor();
  attachedObjects: IAttachInfo[] = [];

  constructor(readonly runtime: DocumentRuntime)
  {
    runtime.on("deltaSubmitted", (dds, delta) => this.deltaCompressor.push(dds.id, delta));
    runtime.on("attached", (dds, summary) => this.attachedObjects.push({ id: dds.id, summary }));
  }

  #connection?: DeltaConnection;

  setConnected(connection: DeltaConnection)
  {
    this.#connection = connection;
    this.#connection.on("deltas", deltas =>
    {
      this.inbound.push(deltas);
    });
  }

  readonly inbound = new DeltaQueue<IRemoteDocumentMessage[]>((messages) =>
  {
    for (const message of messages)
    {
      const local = this.#connection!.clientId === message.clientId;
      this.runtime.process(message, local);
    }
  });

  resume()
  {
    this.inbound.resume();

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
