import type { BindableBoolean } from 'osucad-framework';
import { injectionToken } from 'osucad-framework';

export interface ISupportConstantAlgorithmToggle {
  readonly showSpeedChanges: BindableBoolean;
}

// eslint-disable-next-line ts/no-redeclare
export const ISupportConstantAlgorithmToggle = injectionToken<ISupportConstantAlgorithmToggle>();
