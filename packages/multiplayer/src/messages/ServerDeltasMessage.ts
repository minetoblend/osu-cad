import type { Delta } from "../dds/Delta";
import type { BinaryReader, BinaryWriter } from "../serialization";
import { ClientDeltasMessage } from "./ClientDeltasMessage";
import type { Runtime } from "../Runtime";

export class ServerDeltasMessage
{
  constructor(
    readonly clientId: number,
    readonly deltas: Delta[],
  )
  {
  }

  encode(writer: BinaryWriter)
  {
    writer.writeVarInt(this.clientId);
    new ClientDeltasMessage(this.deltas).encode(writer);
  }

  static decode(reader: BinaryReader, runtime: Runtime)
  {
    const clientId = reader.readVarInt();
    const { deltas } = ClientDeltasMessage.decode(reader, runtime);

    return new ServerDeltasMessage(clientId, deltas);
  }
}
