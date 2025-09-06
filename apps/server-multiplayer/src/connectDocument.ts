import type { Socket } from "socket.io";
import type { PartitionManager } from "@osucad/multiplayer-server";
import type { ClientMessages, IConnect, IConnected, ServerMessages } from "@osucad/multiplayer-protocol";

export async function connectDocument(
  socket: Socket<ClientMessages, ServerMessages>,
  partitionManager: PartitionManager,
  message: IConnect,
): Promise<IConnected>
{
  const { documentId } = message;

  const clientId = crypto.randomUUID();

  socket.join(documentId);

  partitionManager.process(documentId, {
    type: "client_join",
    client: { clientId },
  });

  socket.on("disconnect", () =>
  {
    partitionManager.process(documentId, {
      type: "client_leave",
      clientId,
    });
  });

  socket.on("deltas", deltas =>
  {
    partitionManager.process(documentId, {
      type: "deltas",
      clientId,
      content: deltas,
    });
  });

  socket.on("signal", signal =>
  {
    partitionManager.process(documentId, {
      type: "signal",
      clientId,
      content: signal,
    });
  });

  return {
    documentId,
    clientId,
    sequenceNumber: 0,
    clients: [],
  };
}
