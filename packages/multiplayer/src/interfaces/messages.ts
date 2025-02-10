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
