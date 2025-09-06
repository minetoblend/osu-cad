import type { DocumentRuntime, IRemoteDocumentMessage } from "@osucad/multiplayer-core";
import type { Audience } from "./Audience.js";
import type { DeltaConnection } from "./DeltaConnection.js";

export class ProtocolHandler
{
  public constructor(
    private readonly runtime: DocumentRuntime,
    private readonly audience: Audience,
    private readonly connectionProvider: () => DeltaConnection,
  )
  {
  }

  public process(message: IRemoteDocumentMessage)
  {
    switch (message.type)
    {
    case "client_join":
      this.audience.addMember(message.content);
      break;
    case "client_leave":
      this.audience.removeMember(message.content);
      break;
    case "deltas":
    {
      const local = message.clientId === this.connectionProvider().clientId;

      for (const delta of message.content)
        this.runtime.process(delta, local);
    }
    }
  }
}
