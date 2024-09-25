import { ComposeToolInteraction } from './ComposeToolInteraction';
import type { Slider } from '../../../../../beatmap/hitObjects/Slider';
import { PathPoint } from '../../../../../beatmap/hitObjects/PathPoint';

export class CornerRadiusInteraction extends ComposeToolInteraction {
  constructor(
    readonly slider: Slider,
    readonly index: number,
  ) {
    super();

    this.originalPath = [...this.slider.path.controlPoints];
  }

  originalPath: PathPoint[];


}
