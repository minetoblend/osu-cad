import type { Bindable } from "@osucad/framework";
import { injectionToken } from "@osucad/framework";

export interface IComboNumberReference 
{
  readonly indexInComboBindable: Bindable<number>;
}

export const IComboNumberReference = injectionToken<IComboNumberReference>();
