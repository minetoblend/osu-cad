import type { ClientManager } from "./ClientManager.js";

export interface IProcessorSnapshot
{
  readonly sequenceNumber: number
  readonly clients: ClientManager.Client[]
}
