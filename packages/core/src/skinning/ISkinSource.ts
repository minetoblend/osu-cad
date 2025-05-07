import type { Action } from "@osucad/framework";
import { injectionToken } from "@osucad/framework";
import type { ISkin } from "./ISkin";

export interface ISkinSource extends ISkin
{
  readonly sourceChanged: Action

  findProvider(predicate: (skin: ISkin) => boolean): ISkin | null
}

export const ISkinSource = injectionToken<ISkinSource>();
