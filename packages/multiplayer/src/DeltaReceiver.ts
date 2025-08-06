import { Component } from "@osucad/framework";
import type { IConnection } from "./IConnection";
import type { Runtime } from "./Runtime";
import { BinaryReader } from "./serialization";

export class DeltaReceiver extends Component
{
  constructor(
    readonly runtime: Runtime,
    readonly connection: IConnection,
  )
  {
    super();
  }

  process(data: ArrayBuffer)
  {
    const reader = new BinaryReader(data);

    const clientId = reader.readVarInt();

    const count = reader.readVarInt();
    for (let i = 0; i < count; i++)
    {
      const target = this.runtime.getObject(reader.readUuid());
      const length = reader.readVarInt();

      const delta = reader.readBytes(length);

      target?.process(new BinaryReader(delta.buffer), clientId === this.connection.clientId);
    }
  }
}
