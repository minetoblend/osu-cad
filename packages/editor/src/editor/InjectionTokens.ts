import type { Bindable, InjectionToken } from 'osucad-framework';
import type { ToggleBindable } from './screens/compose/ToggleBindable';
import type { EditorScreenType } from './screens/EditorScreenType';

export const NEW_COMBO: InjectionToken<ToggleBindable> = Symbol('NEW_COMBO');
export const SAMPLE_WHISTLE: InjectionToken<ToggleBindable>
  = Symbol('SAMPLE_WHISTLE');
export const SAMPLE_FINISH: InjectionToken<ToggleBindable>
  = Symbol('SAMPLE_FINISH');
export const SAMPLE_CLAP: InjectionToken<ToggleBindable>
  = Symbol('SAMPLE_CLAP');

export const CURRENT_SCREEN: InjectionToken<Bindable<EditorScreenType>> = Symbol('CURRENT_SCREEN');
