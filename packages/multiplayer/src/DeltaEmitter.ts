import type { Runtime } from "./Runtime";
import type { DDS } from "./dds";
import type { Delta } from "./dds/Delta";
import { BinaryWriter } from "./serialization";
import { Component } from "@osucad/framework";
import type { IConnection } from "./IConnection";
import { OpCode } from "./OpCode";
import { ClientDeltasMessage } from "./messages/ClientDeltasMessage";

export class DeltaEmitter extends Component
{
  constructor(
    readonly runtime: Runtime,
    readonly connection: IConnection,
  )
  {
    super();
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.runtime.localOpSubmitted.addListener(this.#localOpSubmitted, this);

    this.scheduler.addDelayed(() => this.#flush(), 50, true);
  }

  #buffer: Delta[] = [];
  #mergeMap = new Map<string, Delta[]>();

  #localOpSubmitted(_dds: DDS, delta: Delta)
  {
    if (delta.mergeKey === undefined)
    {
      this.#buffer.push(delta);
      return;
    }

    const mergeCandidates = this.#mergeMap.get(delta.mergeKey);

    if (mergeCandidates !== undefined)
    {
      for (const candidate of mergeCandidates)
      {
        if (candidate.tryMerge(delta))
        {
          let index = this.#buffer.indexOf(candidate);
          this.#buffer.splice(index, 1);
          this.#buffer.push(candidate);

          index = mergeCandidates.indexOf(candidate);
          mergeCandidates.splice(index, 1);
          mergeCandidates.push(candidate);

          return;
        }
      }
    }
    else
    {
      this.#mergeMap.set(delta.mergeKey, [delta]);
    }

    this.#buffer.push(delta);
  }

  #flush()
  {
    const writer = new BinaryWriter();
    new ClientDeltasMessage(this.#buffer).encode(writer);

    this.#buffer = [];
    this.#mergeMap.clear();

    this.send(writer.buffer);
  }

  send(data: ArrayBuffer)
  {
    this.connection.send(OpCode.Deltas, data);
  }

  override dispose()
  {
    this.runtime.localOpSubmitted.removeListener(this.#localOpSubmitted, this);

    super.dispose();
  }
}

