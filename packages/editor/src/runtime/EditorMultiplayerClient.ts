import { asyncDependencyLoader, Component } from "@osucad/framework";
import type { Delta } from "@osucad/multiplayer-core";
import { MergeableDelta, MultiValueMap, nn } from "@osucad/multiplayer-core";
import type { ServerMessages } from "@osucad/multiplayer-protocol";
import type { EditorBeatmap } from "./dds/EditorBeatmap";
import { EditorRuntime } from "./EditorRuntime";
import { MultiplayerConnection } from "./MultiplayerConnection";
import { sign } from "crypto";

interface IQueuedDeltas
{
  local: boolean;
  deltas: ServerMessages.Delta[];
}

interface SendBufferEntry
{
  targetId: string,
  delta: Delta
}

export class EditorMultiplayerClient extends Component
{
  runtime!: EditorRuntime;

  get editorBeatmap(): EditorBeatmap
  {
    return this.runtime.root;
  }

  connection!: MultiplayerConnection;
  clientId!: number;

  receivedDeltas: IQueuedDeltas[] = [];
  sendBuffer: SendBufferEntry[] = [];
  readonly #mergeMap = new MultiValueMap<string, SendBufferEntry>();

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
      const entry: SendBufferEntry = { targetId: nn(dds.id), delta };

      if (!(delta instanceof MergeableDelta))
        return void this.sendBuffer.push(entry);

      const entries = this.#mergeMap.get(entry.targetId);

      for (let i = entries.length - 1; i >= 0; i--)
      {
        const other = entries[i];
        const otherDelta = other.delta as MergeableDelta;
        if (otherDelta.tryAppend(delta))
        {
          const index = this.sendBuffer.indexOf(other);
          this.sendBuffer.splice(index, 1);
          this.sendBuffer.push(other);
          return;
        }
      }

      this.#mergeMap.add(entry.targetId, entry);
      this.sendBuffer.push(entry);
    });

    this.runtime.on("signalSubmitted", (dds, type,signal) =>
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
    this.#mergeMap.clear();
  }

  override dispose()
  {
    this.runtime.dispose();

    super.dispose();
  }
}
