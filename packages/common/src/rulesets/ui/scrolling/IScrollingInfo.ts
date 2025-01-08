import type { Bindable } from 'osucad-framework';
import type { IScrollAlgorithm } from './algorithms/IScrollAlgorithm';
import type { ScrollingDirection } from './ScrollingDirection';
import { injectionToken } from 'osucad-framework';

export interface IScrollingInfo {
  readonly direction: Bindable<ScrollingDirection>;
  readonly timeRange: Bindable<number>;
  readonly algorithm: Bindable<IScrollAlgorithm>;
}

// eslint-disable-next-line ts/no-redeclare
export const IScrollingInfo = injectionToken<IScrollingInfo>();
