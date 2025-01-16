import type { Slider } from '../hitObjects/Slider';
import { injectionToken } from '@osucad/framework';

export interface IDistanceSnapProvider {
  findSnappedDistance(referenceObject: Slider): number;
}

// eslint-disable-next-line ts/no-redeclare
export const IDistanceSnapProvider = injectionToken<IDistanceSnapProvider>();
