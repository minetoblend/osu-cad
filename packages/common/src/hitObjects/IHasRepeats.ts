import type { Bindable } from 'osucad-framework';

export interface IHasRepeats {
  readonly hasRepeats: true;

  repeatCount: number;

  readonly spanDuration: number;

  readonly repeatCountBindable: Bindable<number>;
}

export function hasRepeats(obj: any): obj is IHasRepeats {
  return !!obj?.hasRepeats;
}
