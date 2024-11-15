import type { InjectionToken } from 'osucad-framework';
import type { HitObject } from '../HitObject';
import type { DrawableHitObject } from './DrawableHitObject';

export interface IPooledHitObjectProvider {
  getPooledDrawableRepresentation: (hitObject: HitObject, parent?: DrawableHitObject) => DrawableHitObject | undefined;
}

// eslint-disable-next-line ts/no-redeclare
export const IPooledHitObjectProvider: InjectionToken<IPooledHitObjectProvider> = Symbol('IPooledHitObjectProvider');
