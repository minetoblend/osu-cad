import type { Bindable } from 'osucad-framework';

export interface IHasDuration {
  readonly hasDuration: true;

  duration: number;

  readonly durationBindable: Bindable<number>;
}

export function hasDuration(obj: any): obj is IHasDuration {
  return !!obj?.hasDuration;
}
