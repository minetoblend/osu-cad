import type { Bindable, BindableBoolean, InjectionToken } from 'osucad-framework';
import type { AdditionsBindable } from '../beatmap/hitSounds/AdditionsBindable';
import type { EditorScreenType } from './screens/EditorScreenType';

export const NEW_COMBO: InjectionToken<BindableBoolean> = Symbol('NEW_COMBO');
export const ADDITIONS: InjectionToken<AdditionsBindable> = Symbol('ADDITIONS');

export const CURRENT_SCREEN: InjectionToken<Bindable<EditorScreenType>> = Symbol('CURRENT_SCREEN');
