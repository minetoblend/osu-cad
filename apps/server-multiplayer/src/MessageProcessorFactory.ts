import type { ClientMessages, ServerMessages } from "@osucad/multiplayer-core";
import type { IMessageProcessorFactory } from "@osucad/multiplayer-server";
import { DocumentMessageProcessor } from "@osucad/multiplayer-server";
import type { Server } from "socket.io";
import type { IDeltaStorage } from "./services/deltas.js";

export class MessageProcessorFactory implements IMessageProcessorFactory
{
  public constructor(
    private readonly io: Server<ClientMessages, ServerMessages>,
    private readonly deltaStore: IDeltaStorage,
  )
  {
  }

  public async create (documentId: string): Promise<DocumentMessageProcessor>
  {
    return new DocumentMessageProcessor(
        documentId,
        {
          send: async (...messages) =>
          {
            this.io.to(documentId).emit("deltas", messages);
            await this.deltaStore.append(documentId, messages);
          },
        },
        {
          send: async (...messages) =>
          {
            for (const message of messages)
              this.io.to(documentId).emit("signal", message);
          },
        },
        undefined,
    );
  }
}
