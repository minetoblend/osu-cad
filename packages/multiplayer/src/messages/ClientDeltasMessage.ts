import { BinaryReader } from "../serialization";
import { BinaryWriter } from "../serialization";
import type { Delta } from "../dds/Delta";
import type { Runtime } from "../Runtime";

export class ClientDeltasMessage
{
  constructor(readonly deltas: Delta[])
  {
  }

  encode(writer: BinaryWriter)
  {
    writer.writeVarInt(this.deltas.length);
    for (const delta of this.deltas)
    {
      writer.writeUuid(delta.targetId);

      const deltaWriter = new BinaryWriter();
      delta.encode(deltaWriter);
      const buffer = deltaWriter.buffer;

      writer.writeVarInt(buffer.byteLength);
      writer.writeBytes(new Uint8Array(buffer));
    }
  }

  static decode(reader: BinaryReader, runtime: Runtime)
  {
    const deltas: Delta[] = [];

    const count = reader.readVarInt();

    for (let i = 0; i < count; i++)
    {
      const targetId = reader.readUuid();
      const length = reader.readVarInt();
      const bytes = reader.readBytes(length);

      const target = runtime.getObject(targetId);

      if (!target)
        continue;

      const delta = target.decodeDelta(new BinaryReader(bytes.buffer));

      deltas.push(delta);
    }

    return new ClientDeltasMessage(deltas);
  }
}
