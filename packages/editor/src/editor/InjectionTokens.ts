import { InjectionToken } from 'osucad-framework';
import { Bindable } from 'osucad-framework';
import { ToggleBindable } from './screens/compose/ToggleBindable';

export const NEW_COMBO: InjectionToken<ToggleBindable> = Symbol('NEW_COMBO');
export const SAMPLE_WHISTLE: InjectionToken<ToggleBindable> =
  Symbol('SAMPLE_WHISTLE');
export const SAMPLE_FINISH: InjectionToken<ToggleBindable> =
  Symbol('SAMPLE_FINISH');
export const SAMPLE_CLAP: InjectionToken<ToggleBindable> =
  Symbol('SAMPLE_CLAP');
