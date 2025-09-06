import type { DDSAttributes } from "./DDS.js";
import type { IClient } from "./messages.js";

export interface IDDSSummary
{
  readonly attributes: DDSAttributes;
  readonly content: unknown;
}

export interface IDocumentSummary
{
  readonly attributes: Record<string, unknown>
  readonly types: DDSAttributes[];
  readonly root: string;
  readonly entries: Record<string, IDDSSummary>;
}

export interface IFullDocumentSummary extends IDocumentSummary
{
  readonly sequenceNumber: number
  readonly audience: {
    clients: IClient[]
  }
}
