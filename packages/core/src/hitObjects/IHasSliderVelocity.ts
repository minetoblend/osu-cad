import type { Bindable } from '@osucad/framework';

export interface IHasSliderVelocity {
  readonly hasSliderVelocity: true;

  sliderVelocity: number;

  sliderVelocityOverride: number | null;

  readonly baseVelocity: number;

  readonly sliderVelocityOverrideBindable: Bindable<number | null>;
}

export function hasSliderVelocity(obj: any): obj is IHasSliderVelocity {
  return !!obj?.hasSliderVelocity;
}
