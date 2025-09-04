import type { IRemoteDocumentMessage } from "@osucad/multiplayer-core";
import { type DocumentRuntime } from "@osucad/multiplayer-core";
import type { DocumentService, DocumentServiceFactory } from "./DocumentService.js";
import type { DeltaConnection } from "./DeltaConnection.js";
import { DeltaManager } from "./DeltaManager.js";
import type { IAudience } from "./Audience.js";
import { Audience } from "./Audience.js";

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
    this.#audience = new Audience();
    this.runtime = runtime;

    this.#deltaManager = new DeltaManager(
        this.runtime,
        this.#audience,
    );
  }

  readonly #serviceFactory: DocumentServiceFactory;
  readonly #deltaManager: DeltaManager;
  readonly #audience: Audience;
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

    const storage = await this.#service.connectToStorage();
    const deltas = await this.#service.connectToDeltaStorage();

    const { summary, sequenceNumber } = await storage.getSummary();

    this.#connection = await this.#service.connectToDeltaStream();

    this.#deltaManager.setConnected(this.#connection);

    await this.runtime.load(summary);

    if (sequenceNumber !== this.#connection?.sequenceNumber)
    {
      let lastObservedSequenceNumber = sequenceNumber;

      do
      {
        const batch = (await deltas.getDeltas(lastObservedSequenceNumber + 1))
          .filter(m => m.sequenceNumber <= this.#connection!.sequenceNumber);

        if (batch.length === 0)
          continue;

        lastObservedSequenceNumber = batch[batch.length - 1].sequenceNumber;

        for (const message of batch)
          this.runtime.process(message, false);

      } while(lastObservedSequenceNumber !== this.#connection!.sequenceNumber);
    }

    console.log(this.#connection?.sequenceNumber);

    this.#deltaManager.resume();
  }
}
