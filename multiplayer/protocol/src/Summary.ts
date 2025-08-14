import type { DDSAttributes } from "./DDS.js";

export interface IDDSSummary
{
  readonly attributes: DDSAttributes;
  readonly content: unknown;
}

export interface IDocumentSummary
{
  readonly schema: {
    readonly types: DDSAttributes[];
    readonly root: { [key: string]: string }
  }
  readonly objects: Record<string, IDDSSummary>;
}
