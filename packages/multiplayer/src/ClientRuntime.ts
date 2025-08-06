import { HistoryManager } from "./HistoryManager";
import { Runtime } from "./Runtime";

export class ClientRuntime extends Runtime
{
  readonly history= new HistoryManager(this);
}
