import type { DDSAttributes } from "./DDS.js";

export interface IDDSSummary
{
  readonly attributes: DDSAttributes;
  readonly content: unknown;
}

export interface IDocumentSummary
{
  readonly types: DDSAttributes[];
  readonly root: string;
  readonly entries: Record<string, IDDSSummary>;
}
