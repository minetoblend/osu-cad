import type { Action, InjectionToken } from '@osucad/framework';
import type { ISkin } from './ISkin';

export interface ISkinSource extends ISkin {
  sourceChanged: Action;

  findProvider: (lookupFunction: (skin: ISkin) => boolean) => ISkin | null;

  get allSources(): ISkin[];
}

// eslint-disable-next-line ts/no-redeclare
export const ISkinSource: InjectionToken<ISkinSource> = Symbol('ISkinSource');
