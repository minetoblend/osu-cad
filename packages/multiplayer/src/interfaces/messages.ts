export interface ISequencedDocumentMessage {
  readonly clientId: number;
  readonly sequenceNumber: number;
  readonly type: string;
  readonly contents: unknown;
}

export interface IOpMessage {
  path: string;
  contents: unknown;
}

export interface IRawOperationMessage {
  documentId: string;
  clientId?: string;
  operation: IDocumentMessage;
}

export interface IDocumentMessage {
  documentId: string;
  type: string;
  contents: string;
  clientId?: string;
}
