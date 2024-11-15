import type { Bindable, IFrameBasedClock } from 'osucad-framework';
import { injectionToken } from 'osucad-framework';

export interface IAnimationTimeReference {
  readonly clock: IFrameBasedClock | null;

  readonly animationStartTime: Bindable<number>;
}

// eslint-disable-next-line ts/no-redeclare
export const IAnimationTimeReference = injectionToken<IAnimationTimeReference>();
