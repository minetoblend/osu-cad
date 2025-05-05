import { Bindable, injectionToken } from "@osucad/framework";

export interface IComboNumberReference {
  readonly indexInComboBindable: Bindable<number>;
}

export const IComboNumberReference = injectionToken<IComboNumberReference>();