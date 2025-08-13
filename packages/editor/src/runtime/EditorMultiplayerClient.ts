import { asyncDependencyLoader, Component } from "@osucad/framework";
import { MultiplayerConnection } from "./MultiplayerConnection";
import { EditorRuntime } from "./EditorRuntime";
import type { ClientMessages, ServerMessages } from "@osucad/multiplayer-protocol";
import type { EditorBeatmap } from "./dds/EditorBeatmap";
import type { Delta } from "@osucad/multiplayer-core";
import { nn } from "@osucad/multiplayer-core";

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
  sendBuffer: { targetId: string, delta: Delta }[] = [];

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

    this.runtime.on("deltaSubmitted", (dds, delta) =>
    {
      this.sendBuffer.push({ targetId: nn(dds.id), delta });
    });
    this.scheduler.addDelayed(() => this.#flushSendBuffer(), 20, true);
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

    this.connection.send("deltas", this.sendBuffer.map(it => ({ targetId: it.targetId, content: it.delta.encode() })));

    this.sendBuffer = [];
  }

  override dispose()
  {
    this.runtime.dispose();

    super.dispose();
  }
}
