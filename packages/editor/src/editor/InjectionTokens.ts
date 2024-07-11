import { InjectionToken } from 'osucad-framework';
import { Bindable } from 'osucad-framework';

export const NEW_COMBO: InjectionToken<Bindable<boolean>> = Symbol('NEW_COMBO');
