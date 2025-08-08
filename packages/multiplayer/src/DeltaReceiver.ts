import { Component } from "@osucad/framework";
import type { Runtime } from "./Runtime";
import type { BinaryReader } from "./serialization";
import { ServerDeltasMessage } from "./messages/ServerDeltasMessage";

export class DeltaReceiver extends Component
{
  constructor(
    readonly runtime: Runtime,
    readonly clientId: number,
  )
  {
    super();
  }

  process(reader: BinaryReader)
  {
    const { clientId, deltas } = ServerDeltasMessage.decode(reader, this.runtime);

    const local = clientId === this.clientId;

    for (const delta of deltas)
    {
      const target = this.runtime.getObject(delta.targetId);

      target?.process(delta, local);
    }
  }
}
