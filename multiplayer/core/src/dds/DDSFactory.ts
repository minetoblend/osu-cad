import type { DDS } from "./DDS.js";
import type { DDSAttributes } from "./DDSAttributes.js";

export interface DDSFactory<out T extends DDS>
{
  attributes: DDSAttributes
  create(): T
}
