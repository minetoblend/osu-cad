import type { SnapTarget } from './SnapTarget';

export interface IPositionSnapProvider {
  getSnapTargets: () => SnapTarget[];
}
