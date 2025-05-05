import type { Action } from "@osucad/framework";
import { injectionToken } from "@osucad/framework";
import type { ISkin } from "./ISkin";

export interface ISkinSource extends ISkin
{
  readonly sourceChanged: Action
}

export const ISkinSource = injectionToken<ISkinSource>();
