import { Action, injectionToken } from "@osucad/framework";
import { ISkin } from "./ISkin";

export interface ISkinSource extends ISkin 
{
  readonly sourceChanged: Action
}

export const ISkinSource = injectionToken<ISkinSource>();
