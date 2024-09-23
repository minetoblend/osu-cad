import { ComposeToolInteraction } from './ComposeToolInteraction.ts';
import type { Slider } from '../../../../../beatmap/hitObjects/Slider.ts';
import { PathPoint } from '../../../../../beatmap/hitObjects/PathPoint.ts';

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
