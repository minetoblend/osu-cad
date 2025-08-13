import { asyncDependencyLoader, Component } from "@osucad/framework";
import { MultiplayerConnection } from "./MultiplayerConnection";
import { EditorRuntime } from "./EditorRuntime";
import type { ClientMessages, ServerMessages } from "@osucad/multiplayer-protocol";
import type { EditorBeatmap } from "./dds/EditorBeatmap";

interface IQueuedDeltas
{
  local: boolean;
  deltas: ServerMessages.Delta[];
}

export class EditorMultiplayerClient extends Component
{
  readonly runtime = new EditorRuntime();

  get editorBeatmap(): EditorBeatmap
  {
    return this.runtime.root;
  }

  connection!: MultiplayerConnection;
  clientId!: number;

  receivedDeltas: IQueuedDeltas[] = [];
  sendBuffer: ClientMessages.Delta[] = [];

  @asyncDependencyLoader()
  async #connect()
  {
    this.connection = await MultiplayerConnection.create();

    console.log("Established connection");

    const [{ clientId, summary }] = await this.connection.next("init");

    console.log(`received summary, clientId=${clientId}`);

    this.connection.on("deltas", this.#onDeltasReceived, this);

    this.clientId = clientId;

    await this.runtime.load(summary);

    console.log("EditorRuntime loaded");
  }

  #onDeltasReceived(clientId: number, deltas: ServerMessages.Delta[])
  {
    const local = clientId === this.clientId;

    this.receivedDeltas.push({ local, deltas });
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.scheduler.addDelayed(() => this.#flushSendBuffer(), 50, true);
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

    for (const { local, deltas } of this.receivedDeltas)
    {
      for (const { targetId, content } of deltas)
      {
        this.runtime.process(targetId, content, local);
      }
    }

    this.receivedDeltas = [];
  }

  #flushSendBuffer()
  {
    if (this.sendBuffer.length === 0)
      return;

    this.connection.send("deltas", this.sendBuffer);

    this.sendBuffer = [];
  }

  override dispose()
  {
    this.runtime.dispose();

    super.dispose();
  }
}
