import { asyncDependencyLoader, Component } from "@osucad/framework";
import type { IDDSSummary, IDocumentMessage, IRemoteDocumentMessage } from "@osucad/multiplayer-core";
import { DeltaCompressor, MessageType, nn } from "@osucad/multiplayer-core";
import type { EditorBeatmap } from "./dds";
import { EditorRuntime } from "./EditorRuntime";
import { MultiplayerConnection } from "./MultiplayerConnection";

interface IQueuedDeltas
{
  local: boolean;
  content: IRemoteDocumentMessage;
}

export class EditorMultiplayerClient extends Component
{
  runtime!: EditorRuntime;

  get editorBeatmap(): EditorBeatmap
  {
    return this.runtime.root;
  }

  connection!: MultiplayerConnection;
  clientId!: string;

  receivedDeltas: IQueuedDeltas[] = [];

  readonly deltaCompressor = new DeltaCompressor();

  attachedObjects: { id: string, summary: IDDSSummary }[] = [];

  @asyncDependencyLoader()
  async #connect()
  {
    this.runtime = new EditorRuntime();

    this.connection = await MultiplayerConnection.create();

    console.log("Established connection");

    const [{ clientId, summary }] = await this.connection.next("init");

    console.log(`received summary, clientId=${clientId}`);

    this.connection.on("deltas", this.#onDeltasReceived, this);

    this.clientId = clientId;

    await this.runtime.load(summary);

    console.log("EditorRuntime loaded");
  }

  #onDeltasReceived(messages: IRemoteDocumentMessage[])
  {
    for (const message of messages)
    {
      const local = message.clientId === this.clientId;
      this.receivedDeltas.push({ local, content: message });
    }
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.runtime.on("deltaSubmitted", (dds, delta) => this.deltaCompressor.push(dds.id, delta));
    this.runtime.on("attached", (dds, summary) => this.attachedObjects.push({ id: dds.id, summary }));

    this.runtime.on("signalSubmitted", (dds, type, signal) =>
      this.connection.send("signal", nn(dds.id), type, signal),
    );

    this.connection.on("signal", (clientId, target, type, signal) =>
    {
      if (clientId === this.clientId)
        return;

      this.runtime.processSignal(clientId, target, type, signal);
    });

    this.scheduler.addDelayed(() => this.#flushSendBuffer(), 35, true);
  }

  override update()
  {
    super.update();

    this.#processQueue();
  }

  #processQueue()
  {
    if (this.receivedDeltas.length === 0)
      return;

    for (const { local, content } of this.receivedDeltas)
      this.runtime.process(content, local);

    this.receivedDeltas = [];
  }

  #flushSendBuffer()
  {
    if (!this.deltaCompressor.hasDeltas() && this.attachedObjects.length === 0)
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

    this.connection.send("deltas", messages);
  }

  override dispose()
  {
    this.runtime.dispose();

    super.dispose();
  }
}
