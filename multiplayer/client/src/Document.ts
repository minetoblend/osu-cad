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
  constructor({
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
  readonly runtime: DocumentRuntime;
  #service!: DocumentService;
  #connection?: DeltaConnection;

  get root()
  {
    return this.runtime.root;
  }

  get audience(): IAudience
  {
    return this.#audience;
  }

  static async load(options: {
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

    this.#connection = await this.#service.connectToDeltaStream();
    this.#deltaManager.setConnected(this.#connection);

    await this.runtime.load(this.#connection.summary);

    this.#deltaManager.resume();
  }
}
