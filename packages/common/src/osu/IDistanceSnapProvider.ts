import { Slider } from './slider';

export interface IDistanceSnapProvider {
  findSnappedDistance(reference: Slider, distance: number): number;
}
