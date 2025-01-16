import { Anchor, Axes, Box } from '@osucad/framework';

export class PointVisualization extends Box {
  static readonly MAX_WIDTH = 2;

  constructor() {
    super({
      relativePositionAxes: Axes.Both,
      relativeSizeAxes: Axes.Y,

      width: PointVisualization.MAX_WIDTH,
      height: 0.4,

      anchor: Anchor.CenterLeft,
      origin: Anchor.Center,
    });
  }
}
