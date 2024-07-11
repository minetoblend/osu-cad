import { InjectionToken } from 'osucad-framework';
import { Bindable } from 'osucad-framework';

export const NEW_COMBO: InjectionToken<Bindable<boolean>> = Symbol('NEW_COMBO');
export const SAMPLE_WHISTLE: InjectionToken<Bindable<boolean>> =
  Symbol('SAMPLE_WHISTLE');
export const SAMPLE_FINISH: InjectionToken<Bindable<boolean>> =
  Symbol('SAMPLE_FINISH');
export const SAMPLE_CLAP: InjectionToken<Bindable<boolean>> =
  Symbol('SAMPLE_CLAP');
