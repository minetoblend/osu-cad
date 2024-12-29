import type { Action, Bindable, BindableBoolean, InjectionToken } from 'osucad-framework';
import type { AdditionsBindable } from '../beatmap/hitSounds/AdditionsBindable';
import type { HitSoundState } from '../beatmap/hitSounds/BindableHitSound';
import type { EditorScreenType } from './screens/EditorScreenType';

export const NEW_COMBO: InjectionToken<BindableBoolean> = Symbol('NEW_COMBO');
export const NEW_COMBO_APPLIED: InjectionToken<Action<boolean>> = Symbol('NEW_COMBO_APPLIED');
export const ADDITIONS: InjectionToken<AdditionsBindable> = Symbol('ADDITIONS');
export const HITSOUND: InjectionToken<HitSoundState> = Symbol('HITSOUND');

export const CURRENT_SCREEN: InjectionToken<Bindable<EditorScreenType>> = Symbol('CURRENT_SCREEN');
