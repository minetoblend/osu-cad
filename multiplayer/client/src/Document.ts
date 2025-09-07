import type { IFullDocumentSummary } from "@osucad/multiplayer-core";
import { type DocumentRuntime } from "@osucad/multiplayer-core";
import type { DocumentService, DocumentServiceFactory } from "./DocumentService.js";
import type { DeltaConnection } from "./DeltaConnection.js";
import { DeltaManager } from "./DeltaManager.js";
import type { IAudience } from "./Audience.js";
import { Audience } from "./Audience.js";
import { ProtocolHandler } from "./ProtocolHandler.js";
import type { DeltaStorageService } from "./DeltaStorageService.js";

export interface DocumentOptions
{
  runtime: DocumentRuntime,
  serviceFactory: DocumentServiceFactory
}

export class Document
{
  public constructor({
    runtime,
    serviceFactory,
  }: DocumentOptions)
  {
    this.#serviceFactory = serviceFactory;
    this.runtime = runtime;
    this.#audience = new Audience();
    this.#protocolHandler = new ProtocolHandler(this.runtime, this.#audience, () => this.#connection!);

    this.#deltaManager = new DeltaManager(
        this.runtime,
        this.#protocolHandler,
    );
  }

  readonly #serviceFactory: DocumentServiceFactory;
  readonly #deltaManager: DeltaManager;
  readonly #audience: Audience;
  readonly #protocolHandler: ProtocolHandler;
  public readonly runtime: DocumentRuntime;
  #service!: DocumentService;
  #connection?: DeltaConnection;

  public get root()
  {
    return this.runtime.root;
  }

  public get audience(): IAudience
  {
    return this.#audience;
  }

  public static async load(options: {
    documentId: string,
    serviceFactory: DocumentServiceFactory,
    runtimeFactory: () => Promise<DocumentRuntime>
  })
  {
    const {
      documentId,
      serviceFactory,
      runtimeFactory,
    } = options;

    const runtime = await runtimeFactory();

    const document = new Document({
      serviceFactory,
      runtime,
    });

    await document.#load(documentId);

    return document;
  }

  async #load(documentId: string)
  {
    this.#service = await this.#serviceFactory.createDocumentService(documentId);

    const connectionP = this.#service.connectToDeltaStream();
    const storage = await this.#service.connectToStorage();
    const deltas = await this.#service.connectToDeltaStorage();

    const firstReceivedSequenceNumberP = connectionP
      .then(c => c.initialDeltas.length > 0
          ? c.initialDeltas[0].sequenceNumber
          : new Promise<number>(resolve => c.once("deltas", message => resolve(message[0].sequenceNumber))),
      );

    const { summary } = await storage.getSummary();

    await this.#initializeFromSummary(summary);

    this.#connection = await connectionP;

    this.#audience.setOwnClientId(this.#connection!.clientId);

    this.#deltaManager.setConnected(this.#connection, storage);

    const firstReceivedSequenceNumber = await firstReceivedSequenceNumberP;

    const abortController = new AbortController();

    const timeout = setTimeout(() => abortController.abort("timeout"), 10_000);

    await this.#catchUp(deltas, summary.sequenceNumber, firstReceivedSequenceNumber, abortController.signal);

    clearTimeout(timeout);

    this.#deltaManager.resume();
  }

  async #catchUp(deltas: DeltaStorageService, lastObservedSequenceNumber: number, firstReceivedSequenceNumber: number, signal?: AbortSignal)
  {
    if (lastObservedSequenceNumber !== firstReceivedSequenceNumber - 1)
    {
      while (true)
      {
        signal?.throwIfAborted();

        const batch = await deltas.getDeltas(lastObservedSequenceNumber + 1, firstReceivedSequenceNumber);

        if (batch.length > 0)
        {
          lastObservedSequenceNumber = batch[batch.length - 1].sequenceNumber;

          for (const message of batch)
            this.#protocolHandler.process(message);

          if (lastObservedSequenceNumber === firstReceivedSequenceNumber - 1)
            break;
        }

        await new Promise<void>(resolve => setTimeout(resolve, 200));
      }
    }
  }

  async #initializeFromSummary(summary: IFullDocumentSummary)
  {
    await this.runtime.load(summary);

    for (const client of summary.audience.clients)
      this.#audience.addMember(client);
  }
}
