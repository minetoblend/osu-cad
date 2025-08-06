import type { Runtime } from "./Runtime";
import type { DDS } from "./dds";
import type { Delta } from "./dds/Delta";
import { BinaryWriter } from "./serialization";
import { Component } from "@osucad/framework";
import type { IConnection } from "./IConnection";
import { OpCode } from "./OpCode";

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

    this.scheduler.addDelayed(() => this.#flush(), 50, true);
  }

  #buffer: Delta[] = [];

  #localOpSubmitted(_dds: DDS, delta: Delta)
  {
    this.#buffer.push(delta);
  }

  #encodeDeltas(writer: BinaryWriter)
  {
    writer.writeVarInt(this.#buffer.length);

    for (const delta of this.#buffer)
    {
      writer.writeUuid(delta.targetId);

      const deltaWriter = new BinaryWriter();
      delta.encode(deltaWriter);
      const buffer = deltaWriter.buffer;

      writer.writeVarInt(buffer.byteLength);
      writer.writeBytes(new Uint8Array(buffer));
    }
  }

  #flush()
  {
    const writer = new BinaryWriter();
    this.#encodeDeltas(writer);
    this.#buffer = [];

    this.send(writer.buffer);
  }

  send(data: ArrayBuffer)
  {
    this.connection.send(OpCode.Deltas, data);
  }
}
