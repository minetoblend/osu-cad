import { type Bindable, injectionToken } from '@osucad/framework';

export interface IComboNumberReference {
  readonly indexInComboBindable: Bindable<number>;
}

// eslint-disable-next-line ts/no-redeclare
export const IComboNumberReference = injectionToken<IComboNumberReference>();
