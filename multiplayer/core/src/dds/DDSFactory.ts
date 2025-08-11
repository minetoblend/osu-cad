import type { DDS } from "./DDS.js";

export interface DDSFactory<T extends DDS>
{
  create(): T
}
