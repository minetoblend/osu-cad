import { type DocumentRuntime } from "@osucad/multiplayer-core";
import type { DocumentService, DocumentServiceFactory } from "./DocumentService";
import type { DeltaConnection } from "./DeltaConnection";
import { DeltaManager } from "./DeltaManager";

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
    this.runtime = runtime;

    this.#deltaManager= new DeltaManager(this.runtime);
  }

  readonly #serviceFactory: DocumentServiceFactory;
  readonly #deltaManager: DeltaManager;
  readonly runtime: DocumentRuntime;
  #service!: DocumentService;
  #connection?: DeltaConnection;

  get root()
  {
    return this.runtime.root;
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
