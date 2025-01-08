import type { IComparer } from 'osucad-framework';
import { EffectPoint } from '../../controlPoints/EffectPoint';
import { TimingPoint } from '../../controlPoints/TimingPoint';

export class MultiplierControlPoint {
  static readonly Comparer: IComparer<MultiplierControlPoint> = {
    compare(a: MultiplierControlPoint, b: MultiplierControlPoint) {
      return a.time - b.time;
    },
  };

  get multiplier() {
    return this.velocity * this.effectPoint.scrollSpeed * this.baseBeatLength / this.timingPoint.beatLength;
  }

  time: number;

  baseBeatLength: number = 1000;

  velocity = 1;

  effectPoint = new EffectPoint(0);

  timingPoint = new TimingPoint(0, 1000);

  constructor(time: number = 0) {
    this.time = time;
  }
}
