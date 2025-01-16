import type { IScrollingInfo } from './IScrollingInfo';
import { injectionToken } from '@osucad/framework';

export interface IDrawableScrollingRuleset {
  readonly scrollingInfo: IScrollingInfo;
}

// eslint-disable-next-line ts/no-redeclare
export const IDrawableScrollingRuleset = injectionToken<IDrawableScrollingRuleset>();
