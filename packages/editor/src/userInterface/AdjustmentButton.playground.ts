import { dependencyLoader } from 'osucad-framework';
import { Playground } from '../playground/Playground';
import { AdjustmentButton } from './AdjustmentButton';

export class AdjustmentButtonPlayground extends Playground {
  @dependencyLoader()
  load() {
    this.padding = 20;
    this.add(new AdjustmentButton({
      size: {
        x: 120,
        y: 40,
      },
      label: 'bpm',
      adjustments: [1, 2, 5, 10],
    }));
  }
}
