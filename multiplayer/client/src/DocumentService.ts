import type { IDeltaConnection, IDocumentService, IDocumentStorageService } from "@osucad/multiplayer-client-definitions";
import { io } from "socket.io-client";
import { AsyncLazy } from "./util/AsyncLazy.js";
import { DeltaConnection } from "./DeltaConnection.js";
import type { IClientEndpoints } from "./IClientEndpoints.js";
import { StorageService } from "./StorageService.js";

export class DocumentService implements IDocumentService
{
  constructor(
    readonly documentId: string,
    readonly endpoints: IClientEndpoints,
  )
  {
  }

  readonly #services = new AsyncLazy(async () =>
  {
    const url = new URL(this.endpoints.deltas);

    const socket = io( {
      host: url.host,
      path: url.pathname,
      transports: ["websocket"],
      closeOnBeforeunload: true,
      perMessageDeflate: { threshold: 0 },
    });

    await new Promise<void>((resolve, reject) => socket
      .once("connect", resolve)
      .once("connect_error", reject),
    );

    const deltaConnection = new DeltaConnection(this.documentId, socket.id!, socket);
    const storageService = new StorageService(this.endpoints);

    return { socket, deltaConnection, storageService };
  });

  async connectToStorageService(): Promise<IDocumentStorageService>
  {
    const { storageService } = await this.#services.get();

    return storageService;
  }

  async connectToDeltaStream(): Promise<IDeltaConnection>
  {
    const { deltaConnection } = await this.#services.get();

    return deltaConnection;
  }

  dispose(): void
  {
    this.#services.peek()?.then(({ socket }) => socket.close());
  }
}
